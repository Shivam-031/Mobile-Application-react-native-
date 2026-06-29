import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatsCard({ emoji, title, value, sub, color = '#2F6B3F', trend }) {
  return (
    <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>{title}</Typography>
            <Typography variant="h4" fontWeight={900} color={color} mt={0.5}>{value}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          <Box sx={{ fontSize: 36 }}>{emoji}</Box>
        </Box>
        {trend && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'} fontWeight={700}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">vs last month</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
