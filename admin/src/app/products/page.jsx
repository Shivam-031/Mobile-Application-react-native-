'use client';
import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead,
  TableRow, TablePagination, Chip, Button, TextField, InputAdornment,
  Avatar, ToggleButtonGroup, ToggleButton, CircularProgress,
  Snackbar, Alert,
} from '@mui/material';
import AdminLayout from '../../components/common/AdminLayout';
import api from '../../lib/api';

const STATUS_COLORS = { approved: '#4CAF50', pending: '#FF9800', rejected: '#F44336' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'error' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch a large page once; pagination is client-side so we don't
        // hammer the API when the admin is scrubbing filters.
        const res = await api.get('/products', { params: { limit: 200, page: 1 } });
        if (cancelled) return;
        setProducts(res.data.data?.products || []);
      } catch (err) {
        if (cancelled) return;
        setProducts([]);
        setSnack({ open: true, msg: err.response?.data?.message || 'Failed to load products', severity: 'error' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = products
    .filter((p) => statusFilter === 'all' || p.status === statusFilter)
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.state?.toLowerCase().includes(search.toLowerCase())
    );

  const stockStatus = (stock) =>
    stock === 0 ? { label: 'Out of Stock', color: '#F44336' }
    : stock < 15 ? { label: 'Low Stock', color: '#FF9800' }
    : { label: 'In Stock', color: '#4CAF50' };

  return (
    <AdminLayout>
      <Box mb={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" color="primary">🏺 Products</Typography>
          <Typography color="text.secondary" mt={0.5}>All marketplace products across India</Typography>
        </Box>
        <Button variant="outlined" color="primary" href="/approvals">⏳ Review Pending ({products.filter((p) => p.status === 'pending').length})</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search products or state..." size="small" value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
        />
        <ToggleButtonGroup value={statusFilter} exclusive onChange={(_, v) => v && setStatusFilter(v)} size="small">
          {[['all','All'],['approved','Approved'],['pending','Pending'],['rejected','Rejected']].map(([val, lbl]) => (
            <ToggleButton key={val} value={val} sx={{ fontWeight: 700, px: 2, fontSize: 12 }}>{lbl}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Card>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f8f8' }}>
            <TableRow>
              {['Product', 'Category', 'State', 'Price', 'Stock', 'Sold', 'CO₂', 'Eco', 'Status'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No products match your filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => {
                const ss = stockStatus(p.stock ?? 0);
                return (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: '#2F6B3F15', fontSize: 18, width: 36, height: 36 }}>
                          {p.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0].url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : '🏺'}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={p.category} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={p.state} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{p.price}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: ss.color }}>{p.stock ?? 0} ({ss.label})</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2F6B3F' }}>{p.soldCount ?? 0}</TableCell>
                    <TableCell sx={{ color: '#795548', fontWeight: 600 }}>{p.carbonSaved ?? 0}kg</TableCell>
                    <TableCell>{'⭐'.repeat(p.ecoRating || 0)}</TableCell>
                    <TableCell>
                      <Chip label={p.status} size="small"
                        sx={{ backgroundColor: `${STATUS_COLORS[p.status] || '#9E9E9E'}20`, color: STATUS_COLORS[p.status] || '#9E9E9E', fontWeight: 700, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} />
      </Card>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}