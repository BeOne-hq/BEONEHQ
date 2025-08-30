// --- B1 HQ • Executive Brief (polished UI, no external deps) ---
import { promises as fs } from 'fs';
import path from 'path';
// HQ quick-edit links (adjust if your repo org/name changes)
const REPO = 'https://github.com/BeOne-hq/BEONEHQ';
const EDIT_BRIEF = `${REPO}/edit/main/public/brief.json`;
const EDIT_LANDING = `${REPO}/edit/main/public/landing.json`;

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

const money = (n) => `$${Number(n || 0).toLocaleString()}`;
const isToday = (iso) => iso === new Date().toISOString().slice(0, 10);

export default function Home({ data, error }) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const tasks = (data?.tasks || []).filter(t => (t.status || '').toLowerCase() !== 'done');
  const overdue = tasks.filter(t => t.due_date && t.due_date < todayISO);
  const dueToday = tasks.filter(t => t.due_date && isToday(t.due_date));
  const top10 = [...overdue, ...dueToday].slice(0, 10);

  const contentToday = (data?.content || []).filter(
    c => isToday(c.publish_date) && (c.status || '').toLowerCase() !== 'published'
  );

  const sponsorWatch = (data?.sponsors || [])
    .filter(s => (s.status || '').toLowerCase() !== 'won' && Number(s.contract_value || 0) >= 1000)
    .sort((a, b) => Number(b.contract_value || 0) - Number(a.contract_value || 0));

  const within21 = (d) => {
    if (!d) return false;
    const dt = new Date(d), t = new Date();
    dt.setHours(0,0,0,0); t.setHours(0,0,0,0);
    const diff = (dt - t) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 21;
  };
  const grantsSoon = (data?.grants || []).filter(g => within21(g.deadline));

  const k = data?.kpis || { webDelta: 0, socialDelta: 0, emailDelta: 0, leadsDelta: 0 };

  const churn = (data?.memberships || [])
    .filter(m => (m.status || '').toLowerCase() === 'at-risk' || Number(m.failed_payment_count || 0) > 0)
    .sort((a, b) => Number(b.failed_payment_count || 0) - Number(a.failed_payment_count || 0))
    .slice(0, 10)
    .map(m => ({
      member: m.member,
      status: m.status,
      fails: Number(m.failed_payment_count || 0),
      fee: Number(m.monthly_fee || 0),
      suggestion:
        Number(m.failed_payment_count || 0) >= 3 ? 'Call + 1-month grace' :
        Number(m.failed_payment_count || 0) === 2 ? 'Personal email + retry link' :
        'Friendly reminder to update card'
    }));

  return (
    <main className="wrap">
      <header className="header">
        <div className="brand">
          <div className="logo">be<span className="O">O</span>ne</div>
          <div className="sub">B1 HQ — Morning Executive Brief</div>
        </div>
        <div className="date">{new Date().toDateString()}</div>
      </header>

      {error && <div className="error">Couldn’t load brief.json: {String(error)}</div>}
      {!data && !error && <div className="error">Add <code>public/brief.json</code> to show data.</div>}

      <section className="grid two">
        <Card title="Overdue + Today’s Tasks (Top 10)">
          {top10.length ? (
            <ul className="list">
              {top10.map((t, i) => (
                <li key={i}><b>{t.title || 'Untitled'}</b> — {t.priority || 'medium'} • {t.assignee || '—'} • {t.due_date || '—'}</li>
              ))}
            </ul>
          ) : <Empty>Nothing due right now.</Empty>}
        </Card>

        <Card title="Content Scheduled Today (Unpublished)">
          {contentToday.length ? (
            <ul className="list">
              {contentToday.map((c, i) => (
                <li key={i}><b>{c.title || 'Untitled'}</b> → {c.platform || '—'} ({c.status || 'draft'})</li>
              ))}
            </ul>
          ) : <Empty>No scheduled content today.</Empty>}
        </Card>
      </section>

      <section className="grid three">
        <Card small title="Donations (today)">
          <div className="metric">{money(data?.donationsToday || 0)}</div>
        </Card>
        <Card small title="MRR">
          <div className="metric">{money(data?.mrr || 0)}</div>
        </Card>
        <Card small title="Top Sponsor Watch (≥ $1k)">
          <div className="metric">{sponsorWatch.length || 0}</div>
          <div className="muted">{sponsorWatch.slice(0,3).map(s=>s.name).join(' • ') || '—'}</div>
        </Card>
      </section>

      <Card title="Grants (≤ 21 days)">
        {grantsSoon.length ? (
          <ul className="list">
            {grantsSoon.map((g, i) => (
              <li key={i}><b>{g.name}</b> — due {g.deadline} • owner: {g.owner || '—'} • next: {g.next_action || '—'}</li>
            ))}
          </ul>
        ) : <Empty>No deadlines in the next 21 days.</Empty>}
      </Card>

      <section className="grid two">
        <Card title="KPI Pulse vs 7-day Avg">
          <ul className="list compact">
            <li>Web: <b>{k.webDelta}%</b></li>
            <li>Social: <b>{k.socialDelta}%</b></li>
            <li>Email: <b>{k.emailDelta}%</b></li>
            <li>Leads: <b>{k.leadsDelta}%</b></li>
          </ul>
        </Card>

        <Card title="Membership Churn Risks (Top 10)">
          {churn.length ? (
            <ul className="list">
              {churn.map((m, i) => (
                <li key={i}>
                  <b>{m.member || 'Member'}</b> — {m.status || '—'} • fails: {m.fails} • fee: {money(m.fee)} — <i>{m.suggestion}</i>
                </li>
              ))}
            </ul>
          ) : <Empty>No risks flagged.</Empty>}
        </Card>
      </section>

      <footer className="foot">B1 HQ • branded dashboard • v0.4</footer>

      {/* ----------- Styles (brand skin) ----------- */}
      <style jsx global>{`
        :root {
          --bg: #0B0E14;
          --panel1: #12182A;
          --panel2: #171F36;
          --stroke: #1e2438;
          --text: #E8ECF1;
          --muted: #A9B2CA;
          --accent: #6D8BFF;
          --gold: #D4AF37;
        }
        html, body { margin: 0; background: var(--bg); color: var(--text); }
        * { box-sizing: border-box; }
      `}</style>

      <style jsx>{`
        .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
        .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
        .brand { display: grid; gap: 4px; }
        .logo { font-weight: 900; font-size: 22px; letter-spacing: .5px; }
        .logo .O { color: var(--gold); font-weight: 900; }
        .sub { font-size: 12px; color: var(--muted); }
        .date { font-size: 12px; color: var(--muted); }
        .grid { display: grid; gap: 16px; margin-bottom: 16px; }
        .grid.two { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .grid.three { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        .card {
          border: 1px solid var(--stroke);
          border-radius: 16px;
          padding: 16px;
          background: linear-gradient(180deg, var(--panel1), var(--panel2));
          box-shadow: 0 8px 24px rgba(0,0,0,.25);
        }
        .title { margin: 0 0 8px; font-weight: 800; font-size: 16px; }
        .list { margin: 0; padding-left: 18px; line-height: 1.65; }
        .list.compact li { margin: 4px 0; }
        .metric { font-size: 22px; font-weight: 800; }
        .muted { font-size: 12px; color: var(--muted); margin-top: 6px; }
        .empty { opacity: .7; font-size: 14px; }
        .foot { text-align: center; opacity: .5; font-size: 12px; margin-top: 12px; }
        .error { margin: 12px 0; color: #ff8080; }
      `}</style>
    </main>
  );
}

function Card({ title, small, children }) {
  return (
    <section className="card" data-small={small ? '1' : '0'}>
      <h2 className="title">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
