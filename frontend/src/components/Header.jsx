import React, { useContext, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Typography,
  Breadcrumbs,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  Button,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNoneOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  SearchOutlined,
  PersonOutline,
  SettingsOutlined,
  ExitToAppOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';

export default function Header({ onMobileToggle }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ThemeContext);

  // States
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your spending in 'Entertainment' is 15% lower than last month.", read: false },
    { id: 2, text: "Food budget is approaching 80% utilization.", read: false },
  ]);

  const username = localStorage.getItem('username') || 'User';

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Breadcrumbs builder
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [<Typography key="dash" color="text.primary" sx={{ fontWeight: 600 }}>Dashboard</Typography>];
    
    const pageName = path.slice(1).charAt(0).toUpperCase() + path.slice(2);
    return [
      <Link key="home" to="/" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
        Ledgerly
      </Link>,
      <Typography key="current" color="text.primary" sx={{ fontWeight: 600 }}>
        {pageName}
      </Typography>
    ];
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        bgcolor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        minHeight: 64,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backdropFilter: 'blur(8px)',
        backgroundColor: `${theme.palette.background.default}cc`,
      }}
    >
      {/* Left section: Hamburger (mobile) + Breadcrumbs (desktop) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          color="inherit"
          onClick={onMobileToggle}
          sx={{ display: { md: 'none' }, mr: 1, color: theme.palette.text.secondary }}
        >
          <MenuIcon />
        </IconButton>
        <Breadcrumbs separator="/" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.875rem' }}>
          {getBreadcrumbs()}
        </Breadcrumbs>
      </Box>

      {/* Right section: Toolbar actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        
        {/* Search Mock Button */}
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<SearchOutlined sx={{ fontSize: 20 }} />}
          onClick={() => alert("Press Ctrl+K (or click here) to open Global Quick Search")}
          sx={{
            display: { xs: 'none', md: 'flex' },
            textTransform: 'none',
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            borderRadius: '8px',
            py: 0.6,
            px: 2,
            backgroundColor: theme.palette.background.paper,
            fontSize: '0.8rem',
            '&:hover': {
              borderColor: theme.palette.text.secondary,
            }
          }}
        >
          Quick search...
          <Box
            sx={{
              ml: 2,
              px: 0.8,
              py: 0.1,
              bgcolor: theme.palette.divider,
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            ⌘K
          </Box>
        </Button>

        {/* Theme toggler */}
        <Tooltip title={mode === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}>
          <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.secondary }}>
            {mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton onClick={handleNotifOpen} sx={{ color: theme.palette.text.secondary }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsNoneOutlined />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              width: 320,
              mt: 1.5,
              maxHeight: 400,
              borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllRead} startIcon={<CheckCircleOutline sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0 }}>
                Mark all read
              </Button>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <MenuItem key={n.id} sx={{ whiteSpace: 'normal', py: 1.5, bgcolor: n.read ? 'transparent' : `${theme.palette.primary.main}08` }}>
                <ListItemText
                  primary={n.text}
                  primaryTypographyProps={{ fontSize: '0.8rem', color: n.read ? theme.palette.text.secondary : theme.palette.text.primary, fontWeight: n.read ? 400 : 500 }}
                />
              </MenuItem>
            ))
          )}
        </Menu>

        {/* User avatar menu */}
        <Tooltip title="Account Settings">
          <IconButton onClick={handleProfileOpen} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {username.slice(0, 2).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              width: 220,
              mt: 1.5,
              borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
            }
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{username}</Typography>
            <Typography variant="caption" color="text.secondary">Logged in user</Typography>
          </Box>
          <Divider />
          <MenuItem component={Link} to="/profile" onClick={handleProfileClose} sx={{ py: 1.2 }}>
            <PersonOutline sx={{ mr: 1.5, fontSize: 20, color: theme.palette.text.secondary }} />
            <Typography variant="body2">My Profile</Typography>
          </MenuItem>
          <MenuItem component={Link} to="/settings" onClick={handleProfileClose} sx={{ py: 1.2 }}>
            <SettingsOutlined sx={{ mr: 1.5, fontSize: 20, color: theme.palette.text.secondary }} />
            <Typography variant="body2">Settings</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: theme.palette.error.main }}>
            <ExitToAppOutlined sx={{ mr: 1.5, fontSize: 20, color: 'inherit' }} />
            <Typography variant="body2">Sign Out</Typography>
          </MenuItem>
        </Menu>

      </Box>
    </Box>
  );
}
