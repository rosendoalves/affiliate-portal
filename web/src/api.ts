const API = import.meta.env.VITE_API_URL as string;

export async function ingest(file?: string) {
  const url = new URL(`${API}/ingest/run`);
  if (file) url.searchParams.set('file', file);
  const res = await fetch(url.toString(), { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSummary(params: { from: string; to: string; network?: string; sub?: string; }) {
  const url = new URL(`${API}/reports/summary`);
  Object.entries(params).forEach(([k,v]) => v && url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSubaffiliates(params: { from: string; to: string; }) {
  const url = new URL(`${API}/reports/subaffiliates`);
  Object.entries(params).forEach(([k,v]) => v && url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
