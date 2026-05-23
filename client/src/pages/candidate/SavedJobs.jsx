import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SendIcon from '@mui/icons-material/Send';
import { getSavedJobs, unsaveJob, applyToJob } from '../../api/jobs';
import { getErrorMessage } from '../../api/utils';
import JobCard from '../../components/JobCard';
import PageLoader from '../../components/PageLoader';
import { useNavigate } from 'react-router-dom';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Apply dialog state
  const [applyJob, setApplyJob] = useState(null); // the job being applied to
  const [applyForm, setApplyForm] = useState({ cover_letter: '', expected_salary: '' });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await getSavedJobs();
      const data = res.data?.results || res.data || [];
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load saved jobs.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleRemove = async (jobId) => {
    setRemovingId(jobId);
    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.job_id !== jobId));
      setSnackbar({ open: true, message: 'Removed from saved jobs', severity: 'info' });
    } catch (err) {
      setSnackbar({ open: true, message: getErrorMessage(err, 'Failed to remove.'), severity: 'error' });
    } finally {
      setRemovingId(null);
    }
  };

  const openApplyDialog = (job) => {
    setApplyJob(job);
    setApplyForm({ cover_letter: '', expected_salary: '' });
    setApplyError('');
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyError('');
    try {
      await applyToJob(applyJob.id, {
        job_id: applyJob.id,
        cover_letter: applyForm.cover_letter,
        expected_salary: applyForm.expected_salary ? parseFloat(applyForm.expected_salary) : undefined,
      });
      setApplyJob(null);
      setSnackbar({ open: true, message: 'Application submitted successfully!', severity: 'success' });
    } catch (err) {
      setApplyError(getErrorMessage(err, 'Failed to submit application.'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Saved Jobs</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Jobs you&apos;ve bookmarked for later
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {savedJobs.length === 0 ? (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 8, border: '1px dashed', borderColor: 'divider' }}>
          <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>No saved jobs</Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            Save jobs you&apos;re interested in to review them later
          </Typography>
          <Button variant="contained" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {savedJobs.filter((item) => item.job).map((item) => {
            const job = item.job;
            const jobId = item.job_id;
            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <JobCard
                  job={job}
                  actionButton={
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SendIcon fontSize="small" />}
                        sx={{ flex: 1 }}
                        onClick={() => openApplyDialog(job)}
                      >
                        Apply
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ flex: 1 }}
                        disabled={removingId === jobId}
                        onClick={() => handleRemove(jobId)}
                        startIcon={removingId === jobId ? <CircularProgress size={14} /> : null}
                      >
                        {removingId === jobId ? 'Removing...' : 'Remove'}
                      </Button>
                    </Stack>
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Apply dialog */}
      <Dialog open={Boolean(applyJob)} onClose={() => setApplyJob(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Apply for {applyJob?.title}</DialogTitle>
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
          <Button onClick={() => setApplyJob(null)} color="inherit">Cancel</Button>
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

export default SavedJobs;
