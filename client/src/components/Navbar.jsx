import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const candidateLinks = [
  { label: 'Jobs', path: '/jobs' },
  { label: 'My Applications', path: '/my-applications' },
  { label: 'Saved Jobs', path: '/saved-jobs' },
];

const employerLinks = [
  { label: 'Dashboard', path: '/hr/dashboard' },
  { label: 'Post Job', path: '/hr/post-job' },
  { label: 'Manage Jobs', path: '/hr/manage-jobs' },
  { label: 'Company', path: '/hr/company' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isEmployer = user?.role === 'employer';
  const navLinks = isEmployer ? employerLinks : candidateLinks;

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/login');
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : '';

  const drawerContent = (
    <Box sx={{ width: 260, pt: 2 }} onClick={() => setDrawerOpen(false)}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WorkIcon color="primary" />
        <Typography variant="h6" fontWeight={700} color="primary">
          JobPortal
        </Typography>
      </Box>
      <Divider />
      {user ? (
        <>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>
              {user.first_name} {user.last_name}
            </Typography>
            <Chip
              label={isEmployer ? 'Employer' : 'Job Seeker'}
              size="small"
              color={isEmployer ? 'secondary' : 'primary'}
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Divider />
          <List dense>
            {navLinks.map((link) => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton component={Link} to={link.path}>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile">
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      ) : (
        <List dense>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/register">
              <ListItemText primary="Register" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              flexGrow: isMobile ? 1 : 0,
            }}
          >
            <WorkIcon color="primary" fontSize="medium" />
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary"
              sx={{ letterSpacing: '-0.3px' }}
            >
              JobPortal
            </Typography>
          </Box>

          {/* Desktop nav links */}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 3, flexGrow: 1 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  color="inherit"
                  sx={{ fontWeight: 500, color: 'text.primary' }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {!isMobile && !user && <Box sx={{ flexGrow: 1 }} />}

          {/* Right side */}
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Chip
                  label={isEmployer ? 'Employer' : 'Job Seeker'}
                  size="small"
                  color={isEmployer ? 'secondary' : 'primary'}
                  variant="outlined"
                />
              )}
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: 'primary.main',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { mt: 0.5, minWidth: 180 } }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleProfileClick}>
                  <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            !isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" component={Link} to="/login">
                  Login
                </Button>
                <Button variant="contained" component={Link} to="/register">
                  Register
                </Button>
              </Box>
            )
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
