import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Refresh,
  FileDownload,
} from '@mui/icons-material';
import { getSummary, getSubaffiliates, ingest, syncFromAPIs } from '../api';

type Summary = { 
  clicks: number; 
  conversions: number; 
  ctr: number; 
  cvr: number; 
  revenue: number; 
  payout: number; 
  epc: number; 
};

type Row = { 
  subCode: string; 
  subName?: string | null; 
  clicks: number; 
  conversions: number; 
  revenue: number; 
  epc: number; 
  ctr: number; 
  cvr: number; 
};

export const Dashboard: React.FC = () => {
  const [from, setFrom] = useState<string>('2025-08-01');
  const [to, setTo] = useState<string>('2025-08-31');
  const [network, setNetwork] = useState<string>('');
  const [sub, setSub] = useState<string>('');
  const [sum, setSum] = useState<Summary | null>(null);
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
      setSum(s);
      setRows(r);
      setMsg('');
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } }; message?: string };
      setMsg(error?.response?.data?.message || error?.message || 'Error loading data');
    } finally {
      setBusy(false);
    }
  }

  async function runIngest() {
    setBusy(true);
    setMsg('');
    try {
      const res = await ingest();
      setMsg(`Ingest ok: read=${res.read} clicks=${res.clicks} conv=${res.conversions} dedup=${res.dedup} (${res.seconds}s)`);
      await load();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } }; message?: string };
      setMsg(error?.response?.data?.message || error?.message || 'Error in ingest');
    } finally {
      setBusy(false);
    }
  }

  async function runSync() {
    setBusy(true);
    setMsg('');
    try {
      const res = await syncFromAPIs(7); // Sync last 7 days
      setMsg(`Sync ok: processed=${res.totalProcessed} errors=${res.errors} (${res.seconds}s)`);
      await load();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } }; message?: string };
      setMsg(error?.response?.data?.message || error?.message || 'Error in sync');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [load]);



  const downloadCSV = (rows: Row[]) => {
    const headers = ['subCode', 'subName', 'clicks', 'conversions', 'revenue', 'epc', 'ctr'];
    const csv = [headers.join(',')]
      .concat(rows.map(r => [r.subCode, r.subName ?? '', r.clicks, r.conversions, r.revenue, r.epc, r.ctr].join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subaffiliates.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (n: number) => {
    return n?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Affiliate Tracking Portal
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="From"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="To"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Network (optional)"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Sub (optional)"
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={load}
                    disabled={!canLoad || busy}
                    startIcon={busy ? <CircularProgress size={20} /> : <Refresh />}
                  >
                    Load
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={runIngest}
                    disabled={busy}
                  >
                    Ingest CSV
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={runSync}
                    disabled={busy}
                    color="secondary"
                  >
                    Sync APIs
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => downloadCSV(rows)}
                    disabled={!rows.length}
                    startIcon={<FileDownload />}
                  >
                    Export CSV
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {msg && (
          <Alert severity={msg.includes('Error') ? 'error' : 'success'} sx={{ mb: 3 }}>
            {msg}
          </Alert>
        )}

        {sum && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Clicks
                  </Typography>
                  <Typography variant="h5">
                    {sum.clicks.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Conversions
                  </Typography>
                  <Typography variant="h5">
                    {sum.conversions.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Revenue
                  </Typography>
                  <Typography variant="h5">
                    ${fmt(sum.revenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    CVR
                  </Typography>
                  <Typography variant="h5">
                    {(sum.cvr * 100).toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    EPC
                  </Typography>
                  <Typography variant="h5">
                    ${sum.epc.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sub-Affiliates Performance
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sub-Affiliate</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                    <TableCell align="right">Conversions</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">EPC</TableCell>
                    <TableCell align="right">CTR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {r.subCode}
                        {r.subName && ` – ${r.subName}`}
                      </TableCell>
                      <TableCell align="right">{r.clicks}</TableCell>
                      <TableCell align="right">{r.conversions}</TableCell>
                      <TableCell align="right">${fmt(r.revenue)}</TableCell>
                      <TableCell align="right">{r.epc.toFixed(4)}</TableCell>
                      <TableCell align="right">{(r.ctr * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                  {!rows.length && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
