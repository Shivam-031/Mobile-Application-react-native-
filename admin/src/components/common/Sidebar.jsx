'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Chip,
} from '@mui/material';
import Cookies from 'js-cookie';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', emoji: '📊' },
  { label: 'Users', href: '/users', emoji: '👥' },
  { label: 'Products', href: '/products', emoji: '🏺' },
  { label: 'Approvals', href: '/approvals', emoji: '✅', badge: 'pending' },
  { label: 'Inventory', href: '/inventory', emoji: '📦' },
  { label: 'Plants', href: '/plants', emoji: '🌿' },
  { label: 'States', href: '/states', emoji: '🗺️' },
  { label: 'Analytics', href: '/analytics', emoji: '📈' },
  { label: 'Carbon Reports', href: '/carbon-reports', emoji: '🌍' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    window.location.href = '/login';
  };

  return (
    <Box sx={{
      width: 260, minHeight: '100vh', backgroundColor: '#1A4A2A',
      display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>
          🌿 Green Yatra
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Admin Panel
        </Typography>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  mx: 1, borderRadius: 2, mb: 0.5,
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>{item.emoji}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.75)' }}
                />
                {item.badge === 'pending' && (
                  <Chip label="New" size="small" sx={{ backgroundColor: '#FF9800', color: '#fff', fontSize: 10, height: 20 }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 18 }}>👤</Avatar>
          <Box>
            <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Admin</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Super Admin</Typography>
          </Box>
        </Box>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,0,0,0.15)' } }}>
          <ListItemIcon sx={{ minWidth: 30, fontSize: 16 }}>🚪</ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}
