
import { promises as fs } from 'fs';
import path from 'path';

export async function getServerSideProps() {
  try {
    const fp = path.join(process.cwd(), 'public', 'landing.json');
    const data = JSON.parse(await fs.readFile(fp, 'utf8'));
    return { props: { data } };
  } catch {
    return { props: { data: null } };
  }
}

export default function Landing({ data }) {
  const ui = {
    bg:'#0B0E14', text:'#E8ECF1', muted:'#A9B2CA', stroke:'#1e2438',
    panel1:'#12182A', panel2:'#171F36', accent:'#6D8BFF', gold:'#D4AF37'
  };
  const Box = ({children, style}) =>
    <section style={{border:`1px solid ${ui.stroke}`,borderRadius:16,padding:16,
      background:`linear-gradient(180deg, ${ui.panel1}, ${ui.panel2})`, ...style}}>{children}</section>;

  if (!data) {
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:ui.bg,color:ui.text}}>
      <div>Add <code>public/landing.json</code> to control this page from HQ.</div>
    </main>;
  }

  const { brand, hero, valueProps=[], sponsors=[], testimonials=[], newsletter, footer } = data;

  return (
    <main style={{background:ui.bg,color:ui.text,fontFamily:'Inter, system-ui',minHeight:'100vh'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px'}}>
        {/* Header */}
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontWeight:900,letterSpacing:.5}}>be<span style={{color:ui.gold}}>O</span>ne</div>
          <nav style={{display:'flex',gap:16,fontSize:14,opacity:.85}}>
            <a href="/portal" style={{color:ui.text,textDecoration:'none'}}>Client Portal</a>
            <a href="/hq" style={{color:ui.text,textDecoration:'none'}}>HQ</a>
          </nav>
        </header>

        {/* Hero */}
        <Box style={{textAlign:'center',padding:'40px 16px',marginBottom:16}}>
          <h1 style={{margin:'0 0 8px',fontSize:32,fontWeight:900}}>
            {hero.headline || `${brand?.name} — ${brand?.tagline}`}
          </h1>
          <p style={{margin:'0 0 16px',opacity:.85}}>{hero.sub}</p>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <a href={hero.ctaLink} style={{padding:'10px 16px',borderRadius:10,background:ui.accent,color:ui.bg,fontWeight:800,textDecoration:'none'}}>
              {hero.ctaText}
            </a>
            <a href={hero.secondaryLink} style={{padding:'10px 16px',borderRadius:10,border:`1px solid ${ui.stroke}`,
              background:ui.panel1,color:ui.text,textDecoration:'none'}}>
              {hero.secondaryText}
            </a>
          </div>
        </Box>

        {/* Value Props */}
        <div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))',marginBottom:16}}>
          {valueProps.map((v,i)=>(
            <Box key={i}>
              <h3 style={{margin:'0 0 6px',fontWeight:800}}>{v.title}</h3>
              <p style={{margin:0,opacity:.85}}>{v.desc}</p>
            </Box>
          ))}
        </div>

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <Box style={{marginBottom:16}}>
            <h2 style={{margin:'0 0 8px',fontWeight:800}}>Sponsors & Partners</h2>
            <ul style={{margin:0,paddingLeft:18,opacity:.9}}>
              {sponsors.map((s,i)=>(<li key={i}><b>{s.name}</b> — {s.tier}</li>))}
            </ul>
          </Box>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <Box style={{marginBottom:16}}>
            <h2 style={{margin:'0 0 8px',fontWeight:800}}>What people say</h2>
            <ul style={{margin:0,paddingLeft:18,opacity:.9}}>
              {testimonials.map((t,i)=>(<li key={i} style={{margin:'6px 0'}}>&ldquo;{t.quote}&rdquo; — <b>{t.name}</b></li>))}
            </ul>
          </Box>
        )}

        {/* Newsletter */}
        {newsletter?.enabled && (
          <Box style={{textAlign:'center',marginBottom:16}}>
            <h3 style={{margin:'0 0 8px',fontWeight:800}}>Stay in the loop</h3>
            <form action={newsletter.endpoint} method="POST" style={{display:'inline-flex',gap:8}}>
              <input name="email" type="email" required placeholder={newsletter.placeholder||'Email'}
                     style={{padding:'10px 12px',borderRadius:10,border:`1px solid ${ui.stroke}`,background:ui.bg,color:ui.text}}/>
              <button style={{padding:'10px 16px',borderRadius:10,border:0,background:ui.accent,color:ui.bg,fontWeight:800}}>
                {newsletter.button||'Subscribe'}
              </button>
            </form>
          </Box>
        )}

        {/* Footer */}
        <footer style={{textAlign:'center',opacity:.6,fontSize:12,marginTop:8}}>
          {footer?.note || `© ${brand?.name || 'Be One'}`}
        </footer>
      </div>
    </main>
  );
}
