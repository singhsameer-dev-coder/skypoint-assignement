import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Divider,
  Paper,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WorkIcon from '@mui/icons-material/Work';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
  });
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    const required = ['first_name', 'last_name', 'email', 'username', 'password'];
    const missing = required.filter((f) => !form[f]);
    if (missing.length) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        setError(messages);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        py: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 560, p: 1 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
            <WorkIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={700} color="primary">
              JobPortal
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} textAlign="center" mb={0.5}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Join thousands of job seekers and employers
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
              {error}
            </Alert>
          )}

          {/* Role selector */}
          <Typography variant="body2" fontWeight={600} mb={1.5}>
            I am a...
          </Typography>
          <Grid container spacing={2} mb={3}>
            {[
              {
                value: 'job_seeker',
                label: "I'm a Job Seeker",
                subtitle: 'Find your dream job',
                icon: <PersonSearchIcon sx={{ fontSize: 32 }} />,
              },
              {
                value: 'employer',
                label: "I'm an Employer",
                subtitle: 'Hire top talent',
                icon: <BusinessCenterIcon sx={{ fontSize: 32 }} />,
              },
            ].map((opt) => (
              <Grid item xs={6} key={opt.value}>
                <Paper
                  onClick={() => setRole(opt.value)}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: role === opt.value ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    textAlign: 'center',
                    bgcolor: role === opt.value ? 'primary.50' : 'background.paper',
                    transition: 'all 0.15s',
                    position: 'relative',
                    '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
                  }}
                >
                  {role === opt.value && (
                    <CheckCircleIcon
                      color="primary"
                      sx={{ position: 'absolute', top: 8, right: 8, fontSize: 20 }}
                    />
                  )}
                  <Box sx={{ color: role === opt.value ? 'primary.main' : 'text.secondary', mb: 1 }}>
                    {opt.icon}
                  </Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {opt.subtitle}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="username"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.3 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" textAlign="center">
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" fontWeight={600}>
              Sign in
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
