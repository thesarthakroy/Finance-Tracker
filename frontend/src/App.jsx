import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, Container, Alert, Snackbar, useTheme } from '@mui/material';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// PrivateRoute as a proper component to avoid stale closures
function PrivateRoute({ children }) {
  const token = localStorage.getItem('access');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Collapsible sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {/* Content wrapper */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <Header onMobileToggle={() => setMobileOpen(!mobileOpen)} />
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            px: { xs: 2, sm: 3, md: 4 },
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export default function App() {
  const [error, setError] = useState('');

  const wrap = (C) => (
    <Layout>
      <C onError={setError} />
      {/* Global floating toast notification */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')} variant="filled" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  );

  return (
    <Routes>
      {/* Public Routes — redirect to home if already logged in */}
      <Route
        path="/login"
        element={
          localStorage.getItem('access') ? <Navigate to="/" replace /> : <Auth />
        }
      />
      <Route
        path="/register"
        element={
          localStorage.getItem('access') ? <Navigate to="/" replace /> : <Auth register />
        }
      />

      {/* Protected Routes */}
      <Route path="/" element={<PrivateRoute>{wrap(Dashboard)}</PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute>{wrap(Transactions)}</PrivateRoute>} />
      <Route path="/budgets" element={<PrivateRoute>{wrap(Budgets)}</PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute>{wrap(Reports)}</PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute>{wrap(Profile)}</PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute>{wrap(Settings)}</PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
