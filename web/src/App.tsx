import { useEffect, useMemo, useState } from 'react';
import { getSummary, getSubaffiliates, ingest } from './api';

type Summary = { clicks:number; conversions:number; ctr:number; cvr:number; revenue:number; payout:number; epc:number; };
type Row = { subCode:string; subName?:string|null; clicks:number; conversions:number; revenue:number; epc:number; ctr:number; cvr:number; };

export default function App() {
  const [from, setFrom] = useState<string>('2025-08-01');
  const [to, setTo] = useState<string>('2025-08-31');
  const [network, setNetwork] = useState<string>('');
  const [sub, setSub] = useState<string>('');
  const [sum, setSum] = useState<Summary|null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const canLoad = useMemo(() => !!from && !!to, [from, to]);

  async function load() {
    if (!canLoad) return;
    setBusy(true);
    try {
      const [s, r] = await Promise.all([
        getSummary({ from, to, network: network || undefined, sub: sub || undefined }),
        getSubaffiliates({ from, to }),
      ]);
      setSum(s); setRows(r); setMsg('');
    } catch (e:any) {
      setMsg(e?.message ?? 'Error loading data');
    } finally {
      setBusy(false);
    }
  }

  async function runIngest() {
    setBusy(true); setMsg('');
    try {
      const res = await ingest(); // usa ../data/drop/events.csv por defecto
      setMsg(`Ingest ok: read=${res.read} clicks=${res.clicks} conv=${res.conversions} dedup=${res.dedup} (${res.seconds}s)`);
      await load(); // refresca KPIs y tabla
    } catch (e:any) {
      setMsg(e?.message ?? 'Error in ingest');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui', maxWidth: 1100, margin: '0 auto' }}>
      <h2>Affiliate Tracking – MVP</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>From <input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
        <label>To <input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
        <input placeholder="network (optional)" value={network} onChange={e=>setNetwork(e.target.value)} />
        <input placeholder="sub (optional)" value={sub} onChange={e=>setSub(e.target.value)} />
        <button onClick={load} disabled={!canLoad || busy}>Load</button>
        <button onClick={runIngest} disabled={busy}>Ingest</button>
        <button onClick={()=>downloadCSV(rows)} disabled={!rows.length}>Export CSV</button>
      </div>

      {msg && <div style={{ marginBottom: 12, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}>{msg}</div>}

      {sum && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
          <KPI label="Clicks" value={sum.clicks}/>
          <KPI label="Conversions" value={sum.conversions}/>
          <KPI label="Revenue" value={fmt(sum.revenue)}/>
          <KPI label="Payout" value={fmt(sum.payout)}/>
          <KPI label="CVR" value={(sum.cvr*100).toFixed(2)+'%'}/>
          <KPI label="EPC" value={sum.epc.toFixed(4)}/>
        </div>
      )}

      <table width="100%" cellPadding={8} style={{ borderCollapse:'collapse', border:'1px solid #eee' }}>
        <thead style={{ background:'#fafafa' }}>
          <tr>
            <th align="left">Sub</th>
            <th align="right">Clicks</th>
            <th align="right">Conv</th>
            <th align="right">Revenue</th>
            <th align="right">EPC</th>
            <th align="right">CTR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{ borderTop:'1px solid #eee' }}>
              <td>{r.subCode}{r.subName ? ` – ${r.subName}` : ''}</td>
              <td align="right">{r.clicks}</td>
              <td align="right">{r.conversions}</td>
              <td align="right">{fmt(r.revenue)}</td>
              <td align="right">{r.epc.toFixed(4)}</td>
              <td align="right">{(r.ctr*100).toFixed(2)}%</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} style={{ padding:20, textAlign:'center' }}>No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 12 }}>
      <div style={{ fontSize: 12, opacity: .7 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function fmt(n:number) {
  return n?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function downloadCSV(rows: Row[]) {
  const headers = ['subCode','subName','clicks','conversions','revenue','epc','ctr'];
  const csv = [headers.join(',')]
    .concat(rows.map(r => [r.subCode, r.subName ?? '', r.clicks, r.conversions, r.revenue, r.epc, r.ctr].join(',')))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'subaffiliates.csv'; a.click();
  URL.revokeObjectURL(url);
}
