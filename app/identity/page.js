"use client";

import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Masuk ke akun DAJJAL FAMILY",
    description: "Setiap identitas game akan terhubung ke satu akun website milikmu."
  },
  {
    number: "02",
    title: "Otorisasi akun Darkwar",
    description: "Kamu akan diarahkan melalui metode otorisasi resmi. Password game tidak akan diminta oleh halaman ini."
  },
  {
    number: "03",
    title: "Verifikasi kepemilikan",
    description: "Identitas hanya aktif setelah bukti kepemilikan berhasil diverifikasi."
  }
];

export default function IdentityPage() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <a href="/" style={styles.brand}>
            <span style={styles.brandMark}>◉</span>
            <span>
              <strong style={styles.brandName}>DAJJAL FAMILY</strong>
              <small style={styles.brandSub}>PLAYER IDENTITY CENTER</small>
            </span>
          </a>
          <a href="/" style={styles.backLink}>← Kembali ke beranda</a>
        </header>

        <section style={styles.hero}>
          <div style={styles.eyebrow}>IDENTITAS PEMAIN</div>
          <h1 style={styles.title}>Kelola akun <span style={styles.accent}>Darkwar</span></h1>
          <p style={styles.lead}>
            Satukan beberapa profil game dalam satu akun DAJJAL FAMILY.
            Setiap profil harus diverifikasi sebelum dapat digunakan.
          </p>
        </section>

        <section style={styles.statusCard}>
          <div style={styles.statusTop}>
            <div>
              <div style={styles.cardEyebrow}>STATUS PENGHUBUNGAN</div>
              <h2 style={styles.cardTitle}>Pusat identitas sedang disiapkan</h2>
            </div>
            <span style={styles.statusPill}><i style={styles.statusDot} /> BELUM AKTIF</span>
          </div>
          <p style={styles.statusText}>
            Penghubungan akun belum dibuka. Kami sedang menyiapkan autentikasi akun website
            dan jalur verifikasi resmi agar identitas game tidak dapat diklaim oleh orang lain.
          </p>
          <button type="button" disabled style={styles.disabledButton}>
            Hubungkan akun game
            <span aria-hidden="true"> ↗</span>
          </button>
          <p style={styles.note}>
            Tombol akan tersedia setelah proses autentikasi dan verifikasi resmi siap.
          </p>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <div style={styles.eyebrow}>ALUR PENGHUBUNGAN</div>
              <h2 style={styles.sectionTitle}>Cara kerja identitas</h2>
            </div>
            <button type="button" onClick={() => setShowInfo(!showInfo)} style={styles.infoButton}>
              {showInfo ? "Tutup detail" : "Lihat detail"}
            </button>
          </div>
          <div style={styles.steps}>
            {steps.map((step) => (
              <article key={step.number} style={styles.step}>
                <span style={styles.stepNumber}>{step.number}</span>
                <div>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepText}>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
          {showInfo && (
            <div style={styles.detailPanel}>
              <strong>Perlindungan identitas</strong>
              <ul style={styles.detailList}>
                <li>Satu akun website dapat menghubungkan beberapa akun game.</li>
                <li>Satu identitas game hanya dapat dimiliki satu akun website pada satu waktu.</li>
                <li>Akun yang belum diverifikasi tidak akan ditampilkan sebagai identitas aktif.</li>
                <li>Kamu dapat melepas tautan akun game milikmu sendiri.</li>
                <li>Server game akan dipilih sesuai profil yang dihubungkan, bukan dibatasi ke server 278.</li>
              </ul>
            </div>
          )}
        </section>

        <section style={styles.security}>
          <span style={styles.securityIcon}>⌑</span>
          <div>
            <strong>Keamanan akun adalah prioritas</strong>
            <p>Jangan pernah memasukkan password Darkwar atau kode rahasia akun ke formulir yang tidak berasal dari jalur resmi.</p>
          </div>
        </section>

        <footer style={styles.footer}>DAJJAL FAMILY · NOTHING GOES UNSEEN</footer>
      </div>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #08090d; color: #f2f2f2; font-family: Arial, sans-serif; }
        a { -webkit-tap-highlight-color: transparent; }
        button { font: inherit; }
      `}</style>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "radial-gradient(ellipse at 50% -15%, #321216 0%, #111116 38%, #08090d 75%)", padding: "24px 16px 50px" },
  shell: { width: "100%", maxWidth: "900px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "8px 0 22px", borderBottom: "1px solid #292a31" },
  brand: { display: "flex", alignItems: "center", gap: "11px", color: "#f4f4f4", textDecoration: "none" },
  brandMark: { display: "grid", placeItems: "center", width: "42px", height: "42px", borderRadius: "10px", background: "#751b24", fontSize: "25px" },
  brandName: { display: "block", fontSize: "12px", letterSpacing: "1.5px" },
  brandSub: { display: "block", color: "#888992", fontSize: "9px", letterSpacing: "1.6px", marginTop: "5px" },
  backLink: { color: "#a9a9b1", textDecoration: "none", fontSize: "12px" },
  hero: { padding: "44px 0 28px" },
  eyebrow: { color: "#df5961", fontSize: "10px", fontWeight: 700, letterSpacing: "2.8px" },
  title: { fontSize: "clamp(29px, 6vw, 43px)", lineHeight: 1.12, margin: "13px 0 12px", letterSpacing: "-1.2px" },
  accent: { color: "#e45b64" },
  lead: { maxWidth: "620px", color: "#a5a5ad", fontSize: "14px", lineHeight: 1.8, margin: 0 },
  statusCard: { padding: "25px", borderRadius: "15px", border: "1px solid #493036", background: "linear-gradient(145deg, rgba(55,24,30,.72), rgba(22,23,30,.96) 62%)", boxShadow: "0 18px 55px rgba(0,0,0,.2)" },
  statusTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" },
  cardEyebrow: { color: "#b5a0a3", fontSize: "9px", letterSpacing: "2px" },
  cardTitle: { fontSize: "20px", margin: "9px 0 0", letterSpacing: "-.3px" },
  statusPill: { display: "inline-flex", alignItems: "center", gap: "7px", border: "1px solid #72545a", borderRadius: "30px", padding: "7px 10px", color: "#d9b7bb", fontSize: "9px", letterSpacing: "1px", whiteSpace: "nowrap" },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#d29b55", display: "inline-block" },
  statusText: { color: "#b7b4bb", fontSize: "13px", lineHeight: 1.8, maxWidth: "680px", margin: "17px 0 20px" },
  disabledButton: { border: "1px solid #553238", background: "#432027", color: "#a98d91", borderRadius: "8px", padding: "12px 17px", fontSize: "12px", fontWeight: 700, cursor: "not-allowed", opacity: .8 },
  note: { color: "#85828a", fontSize: "10px", margin: "11px 0 0" },
  section: { marginTop: "38px" },
  sectionHeading: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: "12px", marginBottom: "16px" },
  sectionTitle: { fontSize: "22px", margin: "8px 0 0" },
  infoButton: { border: "1px solid #34343c", background: "#15161c", color: "#c8c8ce", borderRadius: "7px", padding: "8px 11px", fontSize: "10px", cursor: "pointer" },
  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "11px" },
  step: { display: "flex", gap: "13px", padding: "18px", background: "#14151b", border: "1px solid #292a32", borderRadius: "11px", minHeight: "132px" },
  stepNumber: { color: "#e15b64", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", paddingTop: "2px" },
  stepTitle: { fontSize: "13px", lineHeight: 1.45, margin: 0 },
  stepText: { color: "#96969f", fontSize: "11px", lineHeight: 1.7, margin: "8px 0 0" },
  detailPanel: { marginTop: "12px", padding: "18px", border: "1px solid #34343d", borderRadius: "10px", background: "#111218", color: "#d8d8de", fontSize: "12px", lineHeight: 1.7 },
  detailList: { color: "#a5a5ad", paddingLeft: "18px", margin: "10px 0 0" },
  security: { display: "flex", gap: "14px", alignItems: "flex-start", padding: "19px", marginTop: "28px", borderRadius: "11px", border: "1px solid #303039", background: "#111218" },
  securityIcon: { color: "#e15b64", fontSize: "22px", lineHeight: 1 },
  "security strong": { display: "block", fontSize: "12px" },
  "security p": { color: "#96969f", fontSize: "11px", lineHeight: 1.7, margin: "7px 0 0" },
  footer: { textAlign: "center", color: "#666771", fontSize: "9px", letterSpacing: "2px", marginTop: "38px", paddingTop: "20px", borderTop: "1px solid #24252c" }
};
