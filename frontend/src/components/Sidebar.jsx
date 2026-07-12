import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, useTheme, useMediaQuery, Drawer } from '@mui/material';
import {
  DashboardOutlined,
  ReceiptLongOutlined,
  AccountBalanceWalletOutlined,
  AssessmentOutlined,
  PersonOutlineOutlined,
  SettingsOutlined,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

const NAV_ITEMS = [
  { text: 'Dashboard', path: '/', icon: <DashboardOutlined /> },
  { text: 'Transactions', path: '/transactions', icon: <ReceiptLongOutlined /> },
  { text: 'Budgets', path: '/budgets', icon: <AccountBalanceWalletOutlined /> },
  { text: 'Reports', path: '/reports', icon: <AssessmentOutlined /> },
  { text: 'Profile', path: '/profile', icon: <PersonOutlineOutlined /> },
  { text: 'Settings', path: '/settings', icon: <SettingsOutlined /> },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const sidebarWidth = collapsed ? 72 : 240;

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        width: isMobile ? 240 : sidebarWidth,
        overflowX: 'hidden',
      }}
    >
      {/* Brand Logo Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 64,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem' }}>
              L
            </Typography>
          </Box>
          {(!collapsed || isMobile) && (
            <Typography variant="h6" sx={{ fontWeight: 800, background: `linear-gradient(90deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ledgerly
            </Typography>
          )}
        </Box>
        {!isMobile && (
          <IconButton onClick={onToggle} size="small" sx={{ color: theme.palette.text.secondary }}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={isMobile ? onMobileClose : undefined}
                sx={{
                  borderRadius: '8px',
                  justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                  px: 2,
                  py: 1.2,
                  minHeight: 48,
                  bgcolor: isActive ? `${theme.palette.primary.main}12` : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: isActive ? `${theme.palette.primary.main}18` : theme.palette.action.hover,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed && !isMobile ? 0 : 2,
                    justifyContent: 'center',
                    color: isActive ? theme.palette.primary.main : 'inherit',
                    transition: 'color 0.2s',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, border: 'none' },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {content}
    </Box>
  );
}
