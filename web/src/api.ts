import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

const api = axios.create({
  baseURL: API_URL,
});

export async function ingest(file?: string) {
  const params = file ? { file } : {};
  const response = await api.post('/ingest/run', null, { params });
  return response.data;
}

export async function getSummary(params: { from: string; to: string; network?: string; sub?: string; }) {
  const response = await api.get('/reports/summary', { params });
  return response.data;
}

export async function getSubaffiliates(params: { from: string; to: string; }) {
  const response = await api.get('/reports/subaffiliates', { params });
  return response.data;
}

export async function syncFromAPIs(days?: number) {
  const params = days ? { days: days.toString() } : {};
  const response = await api.post('/ingest/sync', null, { params });
  return response.data;
}
