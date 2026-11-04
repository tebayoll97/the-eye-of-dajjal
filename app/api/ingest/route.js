
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-ingest-key"
};

function response(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function GET() {
  return response({
    success: true,
    system: "THE EYE OF DAJJAL",
    engine: "Data Ingestion Engine v2",
    status: "online",
    method: "POST"
  });
}

export async function POST(request) {
  let scanId = null;

  try {
    // 1. Authenticate
    const incomingKey = request.headers.get("x-ingest-key");
    const secretKey = process.env.EYE_INGEST_KEY;

    if (!secretKey || incomingKey !== secretKey) {
      return response({
        success: false,
        error: "Unauthorized"
      }, 401);
    }

    // 2. Validate request
    const body = await request.json();

    const {
      server_number,
      category_slug,
      source,
      players
    } = body;

    if (
      !Number.isInteger(server_number) ||
      typeof category_slug !== "string" ||
      !Array.isArray(players) ||
      players.length === 0 ||
      players.length > 1000
    ) {
      return response({
        success: false,
        error: "Invalid payload"
      }, 400);
    }

    // Validate all records before writing
    for (const item of players) {
      const nickname = String(item.nickname || "").trim();
      const rank = Number(item.rank_position);

      if (
        !nickname ||
        !Number.isInteger(rank) ||
        rank < 1
      ) {
        return response({
          success: false,
          error: "Invalid player record"
        }, 400);
      }

      if (
        item.score_numeric != null &&
        !Number.isFinite(Number(item.score_numeric))
      ) {
        return response({
          success: false,
          error: "Invalid numeric score"
        }, 400);
      }
    }

    // 3. Find server
    const { data: server, error: serverError } =
      await supabase
        .from("servers")
        .select("id")
        .eq("server_number", server_number)
        .maybeSingle();

    if (serverError) throw serverError;

    if (!server) {
      return response({
        success: false,
        error: "Server not registered"
      }, 404);
    }

    // 4. Find category
    const { data: category, error: categoryError } =
      await supabase
        .from("leaderboard_categories")
        .select("id")
        .eq("category_slug", category_slug)
        .maybeSingle();

    if (categoryError) throw categoryError;

    if (!category) {
      return response({
        success: false,
        error: "Unknown category"
      }, 400);
    }

    // 5. Create scan record
    const { data: scan, error: scanError } =
      await supabase
        .from("scan_runs")
        .insert({
          server_id: server.id,
          category_id: category.id,
          source: source || "authorized_import",
          status: "running"
        })
        .select("id")
        .single();

    if (scanError) throw scanError;

    scanId = scan.id;

    let savedPlayers = 0;
    let newPlayers = 0;
    let updatedPlayers = 0;

    // 6. Process player records
    for (const item of players) {
      const nickname = String(item.nickname).trim();
      const nicknameKey = nickname.toLowerCase();

      const gamePlayerId = item.game_player_id
        ? String(item.game_player_id).trim()
        : null;

      // First: find by actual game player ID
      let existing = null;

      if (gamePlayerId) {
        const { data, error } = await supabase
          .from("players")
          .select("id, game_player_id")
          .eq("server_id", server.id)
          .eq("game_player_id", gamePlayerId)
          .maybeSingle();

        if (error) throw error;
        existing = data;
      }

      // Fallback: match normalized nickname
      if (!existing) {
        let query = supabase
          .from("players")
          .select("id, game_player_id")
          .eq("server_id", server.id)
          .eq("nickname_key", nicknameKey);

        // If an ID was supplied, only adopt an
        // existing nickname-only record.
        if (gamePlayerId) {
          query = query.is("game_player_id", null);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        existing = data;
      }

      let playerId;

      if (existing) {
        playerId = existing.id;

        const updates = {
          nickname,
          alliance_tag: item.alliance_tag
            ? String(item.alliance_tag).trim()
            : null,
          last_seen: new Date().toISOString()
        };

        // Never erase an existing ID with null
        if (gamePlayerId) {
          updates.game_player_id = gamePlayerId;
        }

        const { error: updateError } = await supabase
          .from("players")
          .update(updates)
          .eq("id", playerId);

        if (updateError) throw updateError;

        updatedPlayers++;

      } else {
        const { data: newPlayer, error: insertError } =
          await supabase
            .from("players")
            .insert({
              server_id: server.id,
              game_player_id: gamePlayerId,
              nickname,
              alliance_tag: item.alliance_tag
                ? String(item.alliance_tag).trim()
                : null
            })
            .select("id")
            .single();

        if (insertError) throw insertError;

        playerId = newPlayer.id;
        newPlayers++;
      }

      // 7. Save leaderboard observation
      const { error: entryError } = await supabase
        .from("leaderboard_entries")
        .insert({
          scan_id: scanId,
          player_id: playerId,
          rank_position: Number(item.rank_position),
          score_raw: item.score_raw == null
            ? null
            : String(item.score_raw),
          score_numeric: item.score_numeric == null
            ? null
            : Number(item.score_numeric)
        });

      if (entryError) throw entryError;

      savedPlayers++;
    }

    // 8. Complete scan
    const { error: finishError } = await supabase
      .from("scan_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        notes: `${savedPlayers} processed; ${newPlayers} new; ${updatedPlayers} updated`
      })
      .eq("id", scanId);

    if (finishError) throw finishError;

    return response({
      success: true,
      message: "Data ingestion completed",
      engine: "v2",
      server: server_number,
      category: category_slug,
      players_processed: savedPlayers,
      new_players: newPlayers,
      updated_players: updatedPlayers,
      scan_id: scanId
    });

  } catch (error) {
    if (scanId) {
      await supabase
        .from("scan_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          notes: String(error.message).slice(0, 500)
        })
        .eq("id", scanId);
    }

    return response({
      success: false,
      error: "Ingestion failed",
      details: error.message
    }, 500);
  }
}
