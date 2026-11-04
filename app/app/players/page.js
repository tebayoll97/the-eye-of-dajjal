
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverName, setServerName] = useState("SERVER 278");

  useEffect(() => {
    async function loadPlayers() {
      setLoading(true);

      const { data: server, error: serverError } = await supabase
        .from("servers")
        .select("id, name")
        .eq("server_number", 278)
        .maybeSingle();

      if (serverError || !server) {
        setError(serverError?.message || "Server 278 tidak ditemukan.");
        setLoading(false);
        return;
      }

      setServerName(server.name || "SERVER 278");

      const { data, error: playerError } = await supabase
        .from("players")
        .select("id, game_player_id, nickname, alliance_tag, first_seen, last_seen")
        .eq("server_id", server.id)
        .order("nickname", { ascending: true });

      if (playerError) {
        setError(playerError.message);
      } else {
        setPlayers(data || []);
      }

      setLoading(false);
    }

    loadPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return players;

    return players.filter((player) =>
      [
        player.nickname,
        player.game_player_id,
        player.alliance_tag
      ].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [players, search]);

  function formatDate(value) {
    if (!value) return "Unknown";

    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#090b10",
      color: "#eeeeee",
      fontFamily: "Arial, sans-serif",
      padding: "22px",
      boxSizing: "border-box"
    }}>

      <header style={{
        borderBottom: "1px solid #292d35",
        paddingBottom: "18px"
      }}>
        <div style={{
          color: "#db444c",
          fontSize: "11px",
          letterSpacing: "2px"
        }}>
          THE EYE OF DAJJAL
        </div>

        <h1 style={{ marginBottom: "5px" }}>
          PLAYER DATABASE
        </h1>

        <p style={{ color: "#888", fontSize: "13px" }}>
          {serverName} · PLAYER INTELLIGENCE
        </p>
      </header>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
        gap: "12px",
        marginTop: "24px"
      }}>
        <div style={{
          background: "#171a21",
          border: "1px solid #292d35",
          borderRadius: "10px",
          padding: "18px"
        }}>
          <div style={{ color: "#999", fontSize: "11px" }}>
            TOTAL PLAYERS
          </div>
          <div style={{ fontSize: "28px", marginTop: "8px" }}>
            {players.length}
          </div>
        </div>

        <div style={{
          background: "#171a21",
          border: "1px solid #292d35",
          borderRadius: "10px",
          padding: "18px"
        }}>
          <div style={{ color: "#999", fontSize: "11px" }}>
            SEARCH RESULTS
          </div>
          <div style={{ fontSize: "28px", marginTop: "8px" }}>
            {filteredPlayers.length}
          </div>
        </div>
      </section>

      <section style={{ marginTop: "25px" }}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search nickname, Player ID, alliance..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "16px",
            borderRadius: "9px",
            border: "1px solid #393e49",
            background: "#171a21",
            color: "#fff",
            fontSize: "14px",
            outline: "none"
          }}
        />
      </section>

      <section style={{ marginTop: "25px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3>DETECTED PLAYERS</h3>
          <span style={{ color: "#888", fontSize: "11px" }}>
            {filteredPlayers.length} RECORDS
          </span>
        </div>

        {loading ? (
          <p style={{ color: "#aaa" }}>Loading player database...</p>
        ) : error ? (
          <p style={{ color: "#e34b55" }}>{error}</p>
        ) : filteredPlayers.length === 0 ? (
          <div style={{
            background: "#171a21",
            border: "1px solid #292d35",
            borderRadius: "10px",
            padding: "25px",
            textAlign: "center",
            marginTop: "12px"
          }}>
            <div style={{ fontSize: "30px" }}>🔎</div>
            <h3>No player records found</h3>
            <p style={{ color: "#888", fontSize: "13px" }}>
              {players.length === 0
                ? "No player data has been collected yet."
                : "Try another search keyword."}
            </p>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <article key={player.id} style={{
              background: "#171a21",
              border: "1px solid #292d35",
              borderRadius: "10px",
              padding: "16px",
              marginTop: "10px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px"
              }}>
                <strong>{player.nickname}</strong>
                <span style={{
                  color: "#db444c",
                  fontSize: "12px"
                }}>
                  {player.alliance_tag || "NO ALLIANCE"}
                </span>
              </div>

              <div style={{
                color: "#888",
                fontSize: "12px",
                marginTop: "12px"
              }}>
                PLAYER ID: {player.game_player_id || "NOT RECORDED"}
              </div>

              <div style={{
                color: "#777",
                fontSize: "11px",
                marginTop: "8px"
              }}>
                LAST SEEN: {formatDate(player.last_seen)}
              </div>
            </article>
          ))
        )}
      </section>

      <footer style={{
        marginTop: "40px",
        padding: "20px 0",
        borderTop: "1px solid #292d35",
        textAlign: "center",
        color: "#666",
        fontSize: "10px",
        letterSpacing: "2px"
      }}>
        NOTHING GOES UNSEEN.
      </footer>

    </main>
  );
}
