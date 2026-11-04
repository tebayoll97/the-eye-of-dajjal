
const stats = [
  { label: "PLAYERS DETECTED", icon: "👥" },
  { label: "TOP COMBAT POWER", icon: "⚡" },
  { label: "TOP KILLS", icon: "☠️" },
  { label: "ACTIVE SHIELDS", icon: "🛡️" }
];

const categories = [
  "Combat Power",
  "Kills",
  "Headquarters",
  "Hero Power",
  "Army Power",
  "Science Power",
  "Building Power"
];

export default function Home() {
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
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderBottom: "1px solid #292d35",
        paddingBottom: "20px"
      }}>
        <div style={{
          background: "#751b22",
          padding: "12px",
          borderRadius: "9px",
          fontSize: "25px"
        }}>◉</div>

        <div>
          <div style={{
            fontWeight: "bold",
            letterSpacing: "1.5px"
          }}>
            THE EYE OF DAJJAL
          </div>
          <small style={{color:"#888"}}>
            BATTLEFIELD INTELLIGENCE SYSTEM
          </small>
        </div>
      </header>

      <section style={{marginTop:"32px"}}>
        <small style={{
          color:"#db444c",
          letterSpacing:"3px"
        }}>
          COMMAND CENTER
        </small>

        <h1 style={{
          fontSize:"32px",
          margin:"10px 0"
        }}>
          SERVER 278
        </h1>

        <p style={{color:"#888",fontSize:"13px"}}>
          Battlefield intelligence overview
        </p>
      </section>

      <section style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",
        gap:"12px",
        marginTop:"25px"
      }}>
        {stats.map((item) => (
          <div key={item.label} style={{
            background:"#171a21",
            border:"1px solid #292d35",
            borderRadius:"10px",
            padding:"18px"
          }}>
            <div style={{fontSize:"23px"}}>
              {item.icon}
            </div>
            <div style={{
              color:"#999",
              fontSize:"10px",
              marginTop:"14px",
              letterSpacing:"1px"
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize:"27px",
              fontWeight:"bold",
              marginTop:"8px"
            }}>—</div>
          </div>
        ))}
      </section>

      <section style={{
        marginTop:"28px",
        background:"#171a21",
        border:"1px solid #292d35",
        borderRadius:"10px",
        padding:"20px"
      }}>
        <h3 style={{marginTop:0}}>
          SYSTEM STATUS
        </h3>

        <div style={{
          display:"flex",
          justifyContent:"space-between",
          gap:"10px",
          padding:"12px 0",
          borderBottom:"1px solid #30343c"
        }}>
          <span style={{color:"#aaa",fontSize:"13px"}}>
            Leaderboard connection
          </span>
          <span style={{color:"#e5a43b",fontSize:"12px"}}>
            NOT CONNECTED
          </span>
        </div>

        <div style={{
          display:"flex",
          justifyContent:"space-between",
          padding:"12px 0"
        }}>
          <span style={{color:"#aaa",fontSize:"13px"}}>
            Last data scan
          </span>
          <span style={{color:"#aaa",fontSize:"12px"}}>
            NO DATA
          </span>
        </div>
      </section>

      <section style={{marginTop:"30px"}}>
        <h3>LEADERBOARD CATEGORIES</h3>

        {categories.map((category,index) => (
          <div key={category} style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            padding:"15px",
            marginTop:"8px",
            background:"#171a21",
            borderRadius:"8px",
            border:"1px solid #292d35"
          }}>
            <span style={{fontSize:"13px"}}>
              {String(index+1).padStart(2,"0")} · {category}
            </span>
            <span style={{
              color:"#777",
              fontSize:"11px"
            }}>
              PENDING
            </span>
          </div>
        ))}
      </section>

      <footer style={{
        marginTop:"45px",
        padding:"20px 0",
        borderTop:"1px solid #292d35",
        textAlign:"center",
        color:"#666",
        fontSize:"10px",
        letterSpacing:"2px"
      }}>
        NOTHING GOES UNSEEN.
        <br/><br/>
        THE EYE OF DAJJAL © 2026
      </footer>

    </main>
  );
}
