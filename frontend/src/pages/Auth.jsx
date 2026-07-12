import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountBalanceWalletOutlined, ArrowForward } from '@mui/icons-material';
import api from '../services/api';
import PageTransition from '../components/PageTransition';

export default function Auth({ register = false }) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Form states
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getAuthErrorMessage = (error) => {
    const data = error.response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(' ');
      const fieldErrors = Object.keys(data)
        .map((key) => {
          const value = data[key];
          if (Array.isArray(value)) return `${key}: ${value.join(' ')}`;
          if (typeof value === 'string') return `${key}: ${value}`;
          return null;
        })
        .filter(Boolean)
        .join(' ');
      if (fieldErrors) return fieldErrors;
    }
    if (error.request) return 'Unable to connect to the server. Please check your API URL or network.';
    return error.message || 'Unable to authenticate. Please check your credentials.';
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (register && form.password !== form.password_confirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (register) {
        await api.post('/register/', form);
        navigate('/login');
      } else {
        const { data } = await api.post('/login/', {
          username: form.username,
          password: form.password,
        });
        // Store tokens only after a confirmed successful response
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('username', form.username.split('@')[0]);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <PageTransition>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          background: isDarkMode
            ? 'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.1) 0px, transparent 50%), #030712'
            : 'radial-gradient(at 50% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(13, 148, 136, 0.05) 0px, transparent 50%), #f8fafc',
          position: 'relative',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, zIndex: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 2px 10px rgba(79, 70, 229, 0.25)',
            }}
          >
            <AccountBalanceWalletOutlined sx={{ fontSize: 22, color: '#ffffff' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5, color: theme.palette.text.primary, fontFamily: "'Outfit', sans-serif" }}>
            Ledgerly
          </Typography>
        </Box>

        {/* Auth Card */}
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: isDarkMode 
              ? '0 10px 30px rgba(0,0,0,0.4)' 
              : '0 10px 30px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            zIndex: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Outfit', sans-serif", textAlign: 'center' }}>
              {register ? 'Create account' : 'Welcome back'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              {register ? 'Get started with Ledgerly today' : 'Sign in to access your wealth portal'}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

            <Box component="form" onSubmit={submit}>
              <TextField
                fullWidth
                required
                name="username"
                label={register ? 'Username' : 'Username or email'}
                value={form.username}
                onChange={change}
                sx={{ mb: 2.5 }}
              />
              
              {register && (
                <TextField
                  fullWidth
                  required
                  type="email"
                  name="email"
                  label="Email Address"
                  value={form.email}
                  onChange={change}
                  sx={{ mb: 2.5 }}
                />
              )}

              <TextField
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                value={form.password}
                onChange={change}
                helperText={register ? 'At least 8 characters' : ''}
                sx={{ mb: register ? 2.5 : 3.5 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {register && (
                <TextField
                  fullWidth
                  required
                  type="password"
                  name="password_confirm"
                  label="Confirm Password"
                  value={form.password_confirm}
                  onChange={change}
                  sx={{ mb: 3.5 }}
                />
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={loading ? null : <ArrowForward />}
                sx={{
                  py: 1.3,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  boxShadow: 'none',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : register ? 'Sign up' : 'Sign in'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" align="center" color="text.secondary">
              {register ? 'Already have an account? ' : 'New to Ledgerly? '}
              <Link
                to={register ? '/login' : '/register'}
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                {register ? 'Sign in' : 'Create an account'}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </PageTransition>
  );
}
