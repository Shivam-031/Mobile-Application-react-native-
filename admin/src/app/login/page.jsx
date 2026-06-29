'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import Cookies from 'js-cookie';
import api from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      const { accessToken, refreshToken, user } = res.data.data;
      if (user.role !== 'MASTER_ADMIN') { setError('Access denied. Admin accounts only.'); return; }
      Cookies.set('accessToken', accessToken, { expires: 7 });
      Cookies.set('refreshToken', refreshToken, { expires: 30 });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', backgroundColor: '#1A4A2A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(74,155,94,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,195,74,0.2) 0%, transparent 50%)',
    }}>
      <Box sx={{ width: '100%', maxWidth: 420, px: 2 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontSize: 64 }}>🌿</Typography>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, mt: 1 }}>
            Green Yatra India
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, mt: 0.5 }}>
            Admin Panel — Secure Login
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} mb={3} color="primary">
              Welcome Back 👋
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Admin Email"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@greenyatra.in"
              />
              <TextField
                label="Password"
                type={showPw ? 'text' : 'password'}
                fullWidth
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                        {showPw ? '🙈' : '👁️'}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontSize: 16, fontWeight: 800, borderRadius: 3 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : '🌿 Login to Admin Panel'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', mt: 3, fontSize: 12 }}>
          Green Yatra India Admin v1.0 · For authorized personnel only
        </Typography>
      </Box>
    </Box>
  );
}
