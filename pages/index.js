const money = (n) => `$${Number(n||0).toLocaleString()}`;


import { promises as fs } from 'fs';
import path from 'path';

export async function getServerSideProps() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'brief.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    return { props: { data } };
  } catch (e) {
    return { props: { data: null, error: String(e) } };
  }
}


export default function Home({ data }) {
  if (!data) return <main style={{padding:24}}>Add <code>public/brief.json</code> to see your brief.</main>;

  const today = new Date().toISOString().slice(0,10);
  const notDone = (data.tasks||[]).filter(t => (t.status||'').toLowerCase() !== 'done');
  const overdue = notDone.filter(t => t.due_date && t.due_date < today);
  const dueToday = notDone.filter(t => t.due_date === today);
  const top10 = [...overdue, ...dueToday].slice(0,10);

  const contentToday = (data.content||[]).filter(c =>
    c.publish_date === today && (c.status||'').toLowerCase() !== 'published'
  );

  const sponsorWatch = (data.sponsors||[])
    .filter(s => (s.status||'').toLowerCase() !== 'won' && Number(s.contract_value||0) >= 1000)
    .sort((a,b)=> Number(b.contract_value||0)-Number(a.contract_value||0));

  const within21 = (d) => { if(!d) return false;
    const dt=new Date(d); const t=new Date(); dt.setHours(0,0,0,0); t.setHours(0,0,0,0);
    const diff=(dt-t)/(1000*60*60*24); return diff>=0 && diff<=21; };
  const grantsSoon = (data.grants||[]).filter(g => within21(g.deadline));

  const churn = (data.memberships||[])
    .filter(m => (m.status||'').toLowerCase()==='at-risk' || Number(m.failed_payment_count||0)>0)
    .sort((a,b)=> Number(b.failed_payment_count||0)-Number(a.failed_payment_count||0))
    .slice(0,10)
    .map(m => ({
      member: m.member,
      status: m.status,
      fails: Number(m.failed_payment_count||0),
      fee: Number(m.monthly_fee||0),
      suggestion: m.failed_payment_count >= 3 ? 'Call + 1-month grace'
        : m.failed_payment_count === 2 ? 'Personal email + retry link'
        : 'Friendly reminder to update card'
    }));

  const k = data.kpis||{webDelta:0,socialDelta:0,emailDelta:0,leadsDelta:0};

  const wrap = { maxWidth:1100, margin:'0 auto', padding:'24px 16px',
    fontFamily:'Inter, system-ui, -apple-system, Segoe UI, Roboto',
    color:'#E8ECF1', background:'#0B0E14' };
  const card = { border:'1px solid #1e2438', borderRadius:16, padding:16,
    background:'linear-gradient(180deg,#12182A,#171F36)', marginBottom:16 };
  const h2 = { margin:'0 0 8px', fontWeight:800 };

  return (
    <main style={wrap}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
        <h1 style={{margin:0,fontWeight:900}}>B1 HQ — Morning Executive Brief</h1>
        <span style={{opacity:.7,fontSize:12}}>{new Date().toDateString()}</span>
      </header>

      <section style={card}>
        <h2 style={h2}>Overdue + Today’s Tasks (Top 10)</h2>
        {top10.length ? (
          <ul style={{margin:0,paddingLeft:18}}>
            {top10.map((t,i)=>(
              <li key={i} style={{margin:'6px 0'}}>
                <b>{t.title||'Untitled'}</b> — {t.priority||'medium'} • {t.assignee||'—'} • {t.due_date||'—'}
              </li>
            ))}
          </ul>
        ) : <div style={{opacity:.7,fontSize:14}}>None</div>}
      </section>

      <section style={card}>
        <h2 style={h2}>Content Scheduled Today (Unpublished)</h2>
        {contentToday.length ? (
          <ul style={{margin:0,paddingLeft:18}}>
            {contentToday.map((c,i)=>(
              <li key={i} style={{margin:'6px 0'}}><b>{c.title||'Untitled'}</b> → {c.platform||'—'} ({c.status||'draft'})</li>
            ))}
          </ul>
        ) : <div style={{opacity:.7,fontSize:14}}>None</div>}
      </section>

      <section style={card}>
        <h2 style={h2}>Money Snapshot</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          <div><div style={{opacity:.7,fontSize:12}}>Donations (today)</div><div style={{fontWeight:800,fontSize:22}}>{money(data.donationsToday)}</div></div>
          <div><div style={{opacity:.7,fontSize:12}}>MRR</div><div style={{fontWeight:800,fontSize:22}}>{money(data.mrr)}</div></div>
          <div><div style={{opacity:.7,fontSize:12}}>Top Sponsor Watch (≥ $1k)</div>
            <div style={{fontSize:14}}>{sponsorWatch.length ? `${sponsorWatch.length} deal(s)` : '—'}</div>
          </div>
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Grants (≤ 21 days)</h2>
        {grantsSoon.length ? (
          <ul style={{margin:0,paddingLeft:18}}>
            {grantsSoon.map((g,i)=>(
              <li key={i} style={{margin:'6px 0'}}>
                <b>{g.name}</b> — due {g.deadline} • owner: {g.owner||'—'} • next: {g.next_action||'—'}
              </li>
            ))}
          </ul>
        ) : <div style={{opacity:.7,fontSize:14}}>None</div>}
      </section>

      <section style={card}>
        <h2 style={h2}>KPI Pulse vs 7-day Avg</h2>
        <ul style={{margin:0,paddingLeft:18,fontSize:14,opacity:.85}}>
          <li>Web: <b>{k.webDelta}%</b></li>
          <li>Social: <b>{k.socialDelta}%</b></li>
          <li>Email: <b>{k.emailDelta}%</b></li>
          <li>Leads: <b>{k.leadsDelta}%</b></li>
        </ul>
      </section>

      <section style={card}>
        <h2 style={h2}>Membership Churn Risks (Top 10)</h2>
        {churn.length ? (
          <ul style={{margin:0,paddingLeft:18}}>
            {churn.map((m,i)=>(
              <li key={i} style={{margin:'6px 0'}}>
                <b>{m.member||'Member'}</b> — {m.status||'—'} • fails: {m.fails} • fee: {money(m.fee)} — <i>{m.suggestion}</i>
              </li>
            ))}
          </ul>
        ) : <div style={{opacity:.7,fontSize:14}}>None</div>}
      </section>

      <footer style={{textAlign:'center',opacity:.5,fontSize:12}}>B1 HQ • branded • v0.3 (JSON mode)</footer>
    </main>
  );
}
