import React, { useContext, useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Switch, FormControlLabel, Divider, Stack, Grid, Alert, Snackbar, useTheme } from '@mui/material';
import { SettingsOutlined, LockOutlined, MailOutline, DarkModeOutlined } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import PageTransition from '../components/PageTransition';

export default function Settings({ onError }) {
  const theme = useTheme();
  const { mode, toggleTheme } = useContext(ThemeContext);

  // States
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({ password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get('/profile/')
      .then(res => setEmail(res.data.email || ''))
      .catch(() => onError('Failed to load settings details.'));
  }, [onError]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile/', { email });
      setSuccessMsg('Email updated successfully.');
    } catch (err) {
      onError(err.response?.data?.detail || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      onError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/profile/', {
        password: passwords.password,
        new_password: passwords.new_password
      });
      setSuccessMsg('Password updated successfully.');
      setPasswords({ password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      onError(err.response?.data?.detail || 'Failed to change password. Make sure old password is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Settings</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Configure your account settings and application theme.</Typography>

        <Grid container spacing={3}>
          {/* General Preferences */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsOutlined color="primary" /> Preferences
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DarkModeOutlined sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Dark Theme</Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Profile details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MailOutline color="primary" /> Profile Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box component="form" onSubmit={handleProfileUpdate}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button type="submit" variant="contained" disabled={loading} size="medium">
                    Save email
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Security details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockOutlined color="primary" /> Change Password
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack component="form" onSubmit={handlePasswordUpdate} spacing={2}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    required
                    value={passwords.password}
                    onChange={e => setPasswords({ ...passwords, password: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    required
                    value={passwords.new_password}
                    onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                    helperText="Minimum 8 characters"
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    required
                    value={passwords.confirm_password}
                    onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                  />
                  <Box>
                    <Button type="submit" variant="contained" disabled={loading} size="medium">
                      Update password
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={Boolean(successMsg)}
          autoHideDuration={4000}
          onClose={() => setSuccessMsg('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccessMsg('')} variant="filled">
            {successMsg}
          </Alert>
        </Snackbar>
      </Box>
    </PageTransition>
  );
}
