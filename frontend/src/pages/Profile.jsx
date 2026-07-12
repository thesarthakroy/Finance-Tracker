import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Avatar, Divider, Skeleton, Paper, useTheme } from '@mui/material';
import { PersonOutline, MailOutline, CalendarTodayOutlined, AccountBalanceOutlined, ReceiptOutlined, StarBorderOutlined } from '@mui/icons-material';
import api from '../services/api';
import PageTransition from '../components/PageTransition';

export default function Profile({ onError }) {
  const theme = useTheme();
  const [profile, setProfile] = useState(null);
  const [txCount, setTxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, txRes] = await Promise.all([
          api.get('/profile/'),
          api.get('/transactions/')
        ]);
        setProfile(profileRes.data);
        setTxCount(txRes.data.count || txRes.data.length || 0);
      } catch (err) {
        onError('Could not load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [onError]);

  if (loading) {
    return (
      <Box sx={{ p: 1 }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="40%" sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const joinDate = profile?.date_joined 
    ? new Date(profile.date_joined).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 1 }}>
        
        {/* Profile Card */}
        <Card sx={{ mb: 4, position: 'relative', overflow: 'visible' }}>
          {/* Header background decoration */}
          <Box
            sx={{
              height: 120,
              borderRadius: '12px 12px 0 0',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          />
          <CardContent sx={{ px: 4, pb: 4, pt: 0 }}>
            {/* Avatar overlapping border */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: -6, mb: 2, gap: 2, flexWrap: 'wrap' }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  bgcolor: theme.palette.primary.dark,
                  color: '#ffffff',
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
              >
                {profile?.username?.slice(0, 2).toUpperCase()}
              </Avatar>
              <Box sx={{ pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {profile?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personal Wealth Member
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              {/* Account details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutline color="primary" /> User Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: theme.palette.action.hover }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                    <MailOutline sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{profile?.email || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarTodayOutlined sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Member Since</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{joinDate}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Statistics */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarBorderOutlined color="primary" /> Account Summary
                </Typography>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: theme.palette.action.hover }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <ReceiptOutlined sx={{ color: theme.palette.primary.main, fontSize: 28, mb: 0.5 }} />
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{txCount}</Typography>
                        <Typography variant="caption" color="text.secondary">Transactions Logged</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <AccountBalanceOutlined sx={{ color: theme.palette.secondary.main, fontSize: 28, mb: 0.5 }} />
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Active</Typography>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

          </CardContent>
        </Card>
      </Box>
    </PageTransition>
  );
}
