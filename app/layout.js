
export const metadata = {
  title: "THE EYE OF DAJJAL",
  description: "Battlefield Intelligence System — Nothing Goes Unseen."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        background: "#08090d",
        color: "#eeeeee",
        fontFamily: "Arial, sans-serif"
      }}>
        {children}
      </body>
    </html>
  );
}
