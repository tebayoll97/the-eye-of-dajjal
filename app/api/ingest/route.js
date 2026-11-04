
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

// CORS configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-ingest-key"
};

// OPTIONS request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// POST request
export async function POST(request) {
  let scanId = null;

  try {
    // 1. Security check
    const incomingKey = request.headers.get("x-ingest-key");
    const secretKey = process.env.EYE_INGEST_KEY;

    if (!secretKey || incomingKey !== secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized"
        },
        {
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // 2. Read request body
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
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload"
        },
        {
          status: 400,
          headers: corsHeaders
        }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: "Server not registered"
        },
        {
          status: 404,
          headers: corsHeaders
        }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: "Unknown category"
        },
        {
          status: 400,
          headers: corsHeaders
        }
      );
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

    // 6. Process players
    for (const item of players) {
      const nickname = String(item.nickname || "").trim();

      if (
        !nickname ||
        !Number.isInteger(item.rank_position) ||
        item.rank_position < 1
      ) {
        throw new Error("Invalid player record");
      }

      const gamePlayerId = item.game_player_id
        ? String(item.game_player_id).trim()
        : null;

      // Find existing player
      let query = supabase
        .from("players")
        .select("id")
        .eq("server_id", server.id);

      query = gamePlayerId
        ? query.eq("game_player_id", gamePlayerId)
        : query.eq("nickname", nickname);

      const { data: existing, error: findError } =
        await query.maybeSingle();

      if (findError) throw findError;

      let playerId;

      if (existing) {
        playerId = existing.id;

        const { error: updateError } = await supabase
          .from("players")
          .update({
            nickname,
            game_player_id: gamePlayerId,
            alliance_tag: item.alliance_tag || null,
            last_seen: new Date().toISOString()
          })
          .eq("id", playerId);

        if (updateError) throw updateError;

      } else {
        const { data: newPlayer, error: insertError } =
          await supabase
            .from("players")
            .insert({
              server_id: server.id,
              game_player_id: gamePlayerId,
              nickname,
              alliance_tag: item.alliance_tag || null
            })
            .select("id")
            .single();

        if (insertError) throw insertError;

        playerId = newPlayer.id;
      }

      // 7. Save leaderboard entry
      const rawScore = item.score_raw == null
        ? null
        : String(item.score_raw);

      const numericScore = item.score_numeric == null
        ? null
        : Number(item.score_numeric);

      if (
        numericScore !== null &&
        !Number.isFinite(numericScore)
      ) {
        throw new Error("Invalid numeric score");
      }

      const { error: entryError } = await supabase
        .from("leaderboard_entries")
        .insert({
          scan_id: scanId,
          player_id: playerId,
          rank_position: item.rank_position,
          score_raw: rawScore,
          score_numeric: numericScore
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
        notes: `${savedPlayers} players processed`
      })
      .eq("id", scanId);

    if (finishError) throw finishError;

    return NextResponse.json(
      {
        success: true,
        message: "Data ingestion completed",
        server: server_number,
        category: category_slug,
        players_processed: savedPlayers,
        scan_id: scanId
      },
      {
        status: 200,
        headers: corsHeaders
      }
    );

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

    return NextResponse.json(
      {
        success: false,
        error: "Ingestion failed",
        details: error.message
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "THE EYE OF DAJJAL API is online. Use POST to submit data."
    },
    {
      status: 200,
      headers: corsHeaders
    }
  );
}
