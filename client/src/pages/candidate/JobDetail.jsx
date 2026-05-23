import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SendIcon from '@mui/icons-material/Send';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, applyToJob, saveJob, unsaveJob, getSavedJobs } from '../../api/jobs';
import { useAuth } from '../../context/AuthContext';
import StatusChip from '../../components/StatusChip';
import PageLoader from '../../components/PageLoader';

const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return 'Not specified';
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = user?.role === 'job_seeker' || !user;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', expected_salary: '' });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await getJob(id);
        setJob(res.data);
      } catch {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== 'job_seeker') return;
    const checkSaved = async () => {
      try {
        const res = await getSavedJobs();
        const savedJobs = res.data?.results || res.data || [];
        setSaved(savedJobs.some((j) => j.job_id === parseInt(id)));
      } catch {
        // ignore
      }
    };
    checkSaved();
  }, [id, user]);

  const handleSaveToggle = async () => {
    if (!user) { navigate('/login'); return; }
    setSavingJob(true);
    try {
      if (saved) {
        await unsaveJob(id);
        setSaved(false);
        setSnackbar({ open: true, message: 'Job removed from saved', severity: 'info' });
      } else {
        await saveJob(id);
        setSaved(true);
        setSnackbar({ open: true, message: 'Job saved!', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to save job.',
        severity: 'error',
      });
    } finally {
      setSavingJob(false);
    }
  };

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    setApplyError('');
    try {
      await applyToJob(id, {
        job_id: parseInt(id),
        cover_letter: applyForm.cover_letter,
        expected_salary: applyForm.expected_salary ? parseFloat(applyForm.expected_salary) : undefined,
      });
      setApplyOpen(false);
      setSnackbar({ open: true, message: 'Application submitted successfully!', severity: 'success' });
      setApplyForm({ cover_letter: '', expected_salary: '' });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to submit application.';
      setApplyError(msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );
  if (!job) return null;

  const sections = [
    { label: 'Description', content: job.description },
    { label: 'Requirements', content: job.requirements },
    { label: 'Responsibilities', content: job.responsibilities },
    { label: 'Benefits', content: job.benefits },
  ].filter((s) => s.content);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
          color="inherit"
        >
          Back
        </Button>

        <Grid container spacing={3}>
          {/* Main content */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              {/* Title & actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} flex={1} pr={2}>
                  {job.title}
                </Typography>
                {user?.role === 'job_seeker' && (
                  <IconButton
                    onClick={handleSaveToggle}
                    disabled={savingJob}
                    color={saved ? 'primary' : 'default'}
                    title={saved ? 'Unsave job' : 'Save job'}
                  >
                    {savingJob ? <CircularProgress size={20} /> : saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                )}
              </Box>

              {/* Company & location */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body1" fontWeight={500}>
                    {job.company?.name || 'Company'}
                  </Typography>
                </Box>
                {job.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">{job.location}</Typography>
                  </Box>
                )}
                {job.application_deadline && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Deadline: {formatDate(job.application_deadline)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Chips */}
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                {job.job_type && <StatusChip status={job.job_type} />}
                {job.work_mode && <StatusChip status={job.work_mode} />}
                {job.experience_level && <StatusChip status={job.experience_level} />}
                {job.category?.name && (
                  <Chip label={job.category.name} variant="outlined" size="small" />
                )}
              </Stack>

              {/* Salary */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <AttachMoneyIcon sx={{ fontSize: 20, color: 'success.main' }} />
                <Typography variant="body1" color="success.main" fontWeight={600}>
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                </Typography>
              </Box>

              {/* Apply button */}
              {isCandidate && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    setApplyOpen(true);
                  }}
                  sx={{ mt: 1 }}
                >
                  Apply Now
                </Button>
              )}
            </Paper>

            {/* Content tabs */}
            {sections.length > 0 && (
              <Paper elevation={1} sx={{ p: 3 }}>
                {sections.length > 1 ? (
                  <>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                      {sections.map((s, i) => (
                        <Tab key={i} label={s.label} />
                      ))}
                    </Tabs>
                    {sections.map((s, i) => (
                      <TabPanel key={i} value={tab} index={i}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                          {s.content}
                        </Typography>
                      </TabPanel>
                    ))}
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      {sections[0].label}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                      {sections[0].content}
                    </Typography>
                  </>
                )}
              </Paper>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Required Skills</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  {job.skills.map((skill) => (
                    <Chip
                      key={skill.id || skill}
                      label={skill.name || skill}
                      variant="filled"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Stack>
              </Paper>
            )}
          </Grid>

          {/* Job Overview — horizontal strip */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Job Overview</Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  '& > *:not(:last-child)': {
                    borderRight: { xs: 'none', sm: '1px solid' },
                    borderColor: 'divider',
                  },
                }}
              >
                {[
                  { label: 'Posted', value: formatDate(job.created_at) },
                  { label: 'Status', value: <StatusChip status={job.status} /> },
                  { label: 'Job Type', value: job.job_type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
                  { label: 'Work Mode', value: job.work_mode?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
                  { label: 'Experience', value: job.experience_level?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
                ].filter((i) => i.value).map((item) => (
                  <Box key={item.label} sx={{ flex: '1 1 0', minWidth: 100, px: 3, py: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                      {item.label.toUpperCase()}
                    </Typography>
                    {typeof item.value === 'string' ? (
                      <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                    ) : item.value}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* About Company */}
          {job.company && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>About Company</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start' }}>
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="body1" fontWeight={700} mb={0.5}>
                      {job.company.name}
                    </Typography>
                    {job.company.industry && (
                      <Typography variant="body2" color="text.secondary">
                        {job.company.industry}
                      </Typography>
                    )}
                    {job.company.headquarters && (
                      <Typography variant="body2" color="text.secondary">
                        HQ: {job.company.headquarters}
                      </Typography>
                    )}
                  </Box>
                  {job.company.description && (
                    <>
                      <Divider orientation="vertical" flexItem />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7, flex: 1, minWidth: 200 }}
                      >
                        {job.company.description.length > 300
                          ? `${job.company.description.slice(0, 300)}...`
                          : job.company.description}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Apply dialog */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Apply for {job.title}</DialogTitle>
        <DialogContent>
          {applyError && <Alert severity="error" sx={{ mb: 2 }}>{applyError}</Alert>}
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Cover Letter"
            value={applyForm.cover_letter}
            onChange={(e) => setApplyForm((p) => ({ ...p, cover_letter: e.target.value }))}
            margin="normal"
            placeholder="Tell the employer why you're a great fit..."
          />
          <TextField
            fullWidth
            label="Expected Salary (optional)"
            type="number"
            value={applyForm.expected_salary}
            onChange={(e) => setApplyForm((p) => ({ ...p, expected_salary: e.target.value }))}
            margin="normal"
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApplyOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={applying}
            startIcon={applying ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default JobDetail;
