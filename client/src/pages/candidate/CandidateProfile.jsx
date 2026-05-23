import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Snackbar,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Autocomplete,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../context/AuthContext';
import { updateMe, getSeekerProfile, updateSeekerProfile } from '../../api/auth';
import { getSkills } from '../../api/jobs';
import PageLoader from '../../components/PageLoader';

const CandidateProfile = () => {
  const { user, updateUser } = useAuth();
  const [basicForm, setBasicForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [seekerForm, setSeekerForm] = useState({
    years_of_experience: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    is_open_to_work: false,
    resume_url: '',
    portfolio_url: '',
    expected_salary: '',
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingSeeker, setSavingSeeker] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const init = async () => {
      try {
        setBasicForm({
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          bio: user?.bio || '',
        });

        const [seekerRes, skillsRes] = await Promise.all([
          getSeekerProfile().catch(() => ({ data: {} })),
          getSkills().catch(() => ({ data: [] })),
        ]);

        const seeker = seekerRes.data || {};
        setSeekerForm({
          years_of_experience: seeker.years_of_experience ?? '',
          location: seeker.location || '',
          linkedin_url: seeker.linkedin_url || '',
          github_url: seeker.github_url || '',
          is_open_to_work: seeker.is_open_to_work ?? false,
          resume_url: seeker.resume_url || '',
          portfolio_url: seeker.portfolio_url || '',
          expected_salary: seeker.expected_salary ?? '',
        });

        const skills = skillsRes.data?.results || skillsRes.data || [];
        setAllSkills(Array.isArray(skills) ? skills : []);
        setSelectedSkills(seeker.skills || []);
      } catch {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    if (user) init();
  }, [user]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicForm((p) => ({ ...p, [name]: value }));
  };

  const handleSeekerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeekerForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveBasic = async () => {
    setSavingBasic(true);
    try {
      const res = await updateMe(basicForm);
      updateUser(res.data);
      setSnackbar({ open: true, message: 'Basic info updated!', severity: 'success' });
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat().join(', ') || 'Failed to update.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSavingBasic(false);
    }
  };

  const handleSaveSeeker = async () => {
    setSavingSeeker(true);
    try {
      const payload = {
        ...seekerForm,
        years_of_experience: seekerForm.years_of_experience !== '' ? Number(seekerForm.years_of_experience) : undefined,
        expected_salary: seekerForm.expected_salary !== '' ? Number(seekerForm.expected_salary) : undefined,
        skill_ids: selectedSkills.map((s) => s.id),
      };
      await updateSeekerProfile(payload);
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat().join(', ') || 'Failed to update.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSavingSeeker(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>My Profile</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your personal and professional information
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Basic Info */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Basic Information</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={basicForm.first_name}
              onChange={handleBasicChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={basicForm.last_name}
              onChange={handleBasicChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={basicForm.email}
              onChange={handleBasicChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={basicForm.phone}
              onChange={handleBasicChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Bio"
              name="bio"
              value={basicForm.bio}
              onChange={handleBasicChange}
              placeholder="Tell employers about yourself..."
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveBasic}
            disabled={savingBasic}
          >
            {savingBasic ? 'Saving...' : 'Save Basic Info'}
          </Button>
        </Box>
      </Paper>

      {/* Seeker Profile */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <WorkIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Professional Profile</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Years of Experience"
              name="years_of_experience"
              type="number"
              value={seekerForm.years_of_experience}
              onChange={handleSeekerChange}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={seekerForm.location}
              onChange={handleSeekerChange}
              placeholder="City, Country"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="LinkedIn URL"
              name="linkedin_url"
              value={seekerForm.linkedin_url}
              onChange={handleSeekerChange}
              placeholder="https://linkedin.com/in/..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="GitHub URL"
              name="github_url"
              value={seekerForm.github_url}
              onChange={handleSeekerChange}
              placeholder="https://github.com/..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Resume URL"
              name="resume_url"
              value={seekerForm.resume_url}
              onChange={handleSeekerChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Portfolio URL"
              name="portfolio_url"
              value={seekerForm.portfolio_url}
              onChange={handleSeekerChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expected Salary"
              name="expected_salary"
              type="number"
              value={seekerForm.expected_salary}
              onChange={handleSeekerChange}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={allSkills}
              getOptionLabel={(opt) => opt.name || opt}
              value={selectedSkills}
              onChange={(_, val) => setSelectedSkills(val)}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              renderTags={(val, getTagProps) =>
                val.map((opt, i) => (
                  <Chip key={opt.id} label={opt.name} size="small" {...getTagProps({ index: i })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Skills" placeholder="Add skills..." />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={seekerForm.is_open_to_work}
                  onChange={handleSeekerChange}
                  name="is_open_to_work"
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Open to Work</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Let employers know you&apos;re actively looking
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSeeker}
            disabled={savingSeeker}
          >
            {savingSeeker ? 'Saving...' : 'Save Profile'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidateProfile;
