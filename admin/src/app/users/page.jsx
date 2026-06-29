'use client';
import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead,
  TableRow, TablePagination, Chip, Button, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, Avatar, CircularProgress, Snackbar, Alert,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import AdminLayout from '../../components/common/AdminLayout';
import api from '../../lib/api';

const ROLE_COLORS = { USER: '#2196F3', EMPLOYEE: '#FF9800', MASTER_ADMIN: '#9C27B0' };
// UI-only label map — the underlying role string stays EMPLOYEE for
// backwards-compat with the DB and authorize() middleware.
const ROLE_LABELS = { USER: 'User', EMPLOYEE: 'Employee', MASTER_ADMIN: 'Admin' };
const INDIAN_STATES = ['Maharashtra','Delhi','Kerala','Rajasthan','Karnataka','Tamil Nadu','Gujarat','West Bengal','Uttar Pradesh','Madhya Pradesh','Assam','Punjab','Odisha','Telangana'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [promoteDialog, setPromoteDialog] = useState({ open: false, user: null });
  const [promoteForm, setPromoteForm] = useState({ role: 'EMPLOYEE', state: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/users', { params: { limit: 200 } });
        if (cancelled) return;
        setUsers(res.data.data?.users || res.data.data || []);
      } catch (err) {
        if (cancelled) return;
        setSnack({ open: true, msg: err.response?.data?.message || 'Failed to load users', severity: 'error' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = users
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const handlePromote = async () => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/users/${promoteDialog.user._id}/role`, promoteForm);
      const updated = res.data.data || { ...promoteDialog.user, ...promoteForm };
      setUsers((prev) => prev.map((u) => u._id === promoteDialog.user._id ? { ...u, ...updated } : u));
      setSnack({ open: true, msg: `${promoteDialog.user.name} updated to ${ROLE_LABELS[promoteForm.role] || promoteForm.role}!`, severity: 'success' });
      setPromoteDialog({ open: false, user: null });
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to update role', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const openPromote = (user) => {
    setPromoteForm({ role: user.role === 'USER' ? 'EMPLOYEE' : 'USER', state: user.state || '' });
    setPromoteDialog({ open: true, user });
  };

  const avgGreenScore = users.length
    ? Math.round(users.reduce((a, u) => a + (u.greenScore || 0), 0) / users.length)
    : 0;

  return (
    <AdminLayout>
      <Box mb={3}>
        <Typography variant="h4" color="primary">👥 User Management</Typography>
        <Typography color="text.secondary" mt={0.5}>Manage users, promote Employees, track green scores</Typography>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#2196F3' },
          { label: 'Employees', value: users.filter((u) => u.role === 'EMPLOYEE').length, color: '#FF9800' },
          { label: 'Admins', value: users.filter((u) => u.role === 'MASTER_ADMIN').length, color: '#9C27B0' },
          { label: 'Avg Green Score', value: avgGreenScore, color: '#4CAF50' },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: 1, minWidth: 140, borderTop: `3px solid ${s.color}` }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={900} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search users..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
          sx={{ minWidth: 250 }}
        />
        <ToggleButtonGroup value={roleFilter} exclusive onChange={(_, v) => v && setRoleFilter(v)} size="small">
          {[['all','All'],['USER','Users'],['EMPLOYEE','Employees'],['MASTER_ADMIN','Admins']].map(([val, lbl]) => (
            <ToggleButton key={val} value={val} sx={{ fontWeight: 700, px: 2, fontSize: 12 }}>{lbl}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Card>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f8f8' }}>
            <TableRow>
              {['User', 'Email', 'Phone', 'Role', 'State', 'Green Score', 'Joined', 'Actions'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: `${ROLE_COLORS[user.role] || '#9E9E9E'}20`, width: 36, height: 36, fontSize: 16 }}>
                        {user.role === 'EMPLOYEE' ? '🏭' : '👤'}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>{user.email}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{user.phone || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[user.role] || user.role}
                      size="small"
                      sx={{ backgroundColor: `${ROLE_COLORS[user.role] || '#9E9E9E'}20`, color: ROLE_COLORS[user.role] || '#9E9E9E', fontWeight: 700, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>{user.state ? <Chip label={user.state} size="small" variant="outlined" color="primary" /> : '—'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, color: '#4CAF50' }}>🌟 {user.greenScore ?? 0}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                  </TableCell>
                  <TableCell>
                    {user.role !== 'MASTER_ADMIN' && (
                      <Button size="small" variant="outlined" color="warning" onClick={() => openPromote(user)} sx={{ fontSize: 11 }}>
                        {user.role === 'USER' ? '⬆️ Promote' : '⬇️ Demote'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={filtered.length}
          page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]}
        />
      </Card>

      {/* Promote Dialog */}
      <Dialog open={promoteDialog.open} onClose={() => !actionLoading && setPromoteDialog({ open: false, user: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Change User Role</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {promoteDialog.user && (
            <Box sx={{ p: 2, backgroundColor: '#f8f8f8', borderRadius: 2 }}>
              <Typography fontWeight={700}>{promoteDialog.user.name}</Typography>
              <Typography variant="body2" color="text.secondary">{promoteDialog.user.email}</Typography>
            </Box>
          )}
          <FormControl fullWidth size="small">
            <InputLabel>New Role</InputLabel>
            <Select value={promoteForm.role} label="New Role" onChange={(e) => setPromoteForm({ ...promoteForm, role: e.target.value })}>
              <MenuItem value="USER">👤 User</MenuItem>
              <MenuItem value="EMPLOYEE">🏭 Employee</MenuItem>
            </Select>
          </FormControl>
          {promoteForm.role === 'EMPLOYEE' && (
            <FormControl fullWidth size="small">
              <InputLabel>Assign State</InputLabel>
              <Select value={promoteForm.state} label="Assign State" onChange={(e) => setPromoteForm({ ...promoteForm, state: e.target.value })}>
                {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPromoteDialog({ open: false, user: null })} variant="outlined" disabled={actionLoading}>Cancel</Button>
          <Button onClick={handlePromote} variant="contained" disabled={actionLoading || (promoteForm.role === 'EMPLOYEE' && !promoteForm.state)}>
            {actionLoading ? <CircularProgress size={18} color="inherit" /> : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}