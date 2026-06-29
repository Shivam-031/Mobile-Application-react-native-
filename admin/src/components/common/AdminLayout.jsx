'use client';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F0E8' }}>
      <Sidebar />
      <Box sx={{ flex: 1, marginLeft: '260px', p: 3, minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
}
