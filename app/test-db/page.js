
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestDatabase() {
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("Menghubungkan...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function testConnection() {
      const { data: serverData, error: serverError } =
        await supabase
          .from("servers")
          .select("server_number, name, is_active");

      const { data: categoryData, error: categoryError } =
        await supabase
          .from("leaderboard_categories")
          .select("category_name, category_slug");

      if (serverError || categoryError) {
        setStatus("Koneksi gagal");
        setError(
          serverError?.message || categoryError?.message
        );
        return;
      }

      setServers(serverData || []);
      setCategories(categoryData || []);
      setStatus("Koneksi berhasil!");
    }

    testConnection();
  }, []);

  return (
    <main style={{
      background: "#08090d",
      color: "#eeeeee",
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "Arial"
    }}>
      <h1>THE EYE OF DAJJAL</h1>
      <h2>DATABASE CONNECTION TEST</h2>

      <h3>Status: {status}</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Servers</h3>
      {servers.map((server) => (
        <p key={server.server_number}>
          Server {server.server_number} — {server.name}
        </p>
      ))}

      <h3>Leaderboard Categories</h3>
      {categories.map((category) => (
        <p key={category.category_slug}>
          {category.category_name}
        </p>
      ))}
    </main>
  );
}
