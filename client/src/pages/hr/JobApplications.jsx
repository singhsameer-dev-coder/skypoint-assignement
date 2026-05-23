import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Snackbar,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InboxIcon from '@mui/icons-material/Inbox';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getJobApplications, updateApplication } from '../../api/jobs';
import StatusChip from '../../components/StatusChip';
import PageLoader from '../../components/PageLoader';

const APPLICATION_STATUSES = [
  'pending',
  'reviewing',
  'shortlisted',
  'interview',
  'offered',
  'rejected',
];

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [notesDialog, setNotesDialog] = useState({ open: false, appId: null, status: '', notes: '' });
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          getJob(jobId),
          getJobApplications(jobId),
        ]);
        setJob(jobRes.data);
        const data = appsRes.data?.results || appsRes.data || [];
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const openStatusUpdate = (app) => {
    setNotesDialog({
      open: true,
      appId: app.id,
      status: app.status,
      notes: app.notes || '',
    });
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await updateApplication(notesDialog.appId, {
        status: notesDialog.status,
        notes: notesDialog.notes,
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === notesDialog.appId
            ? { ...a, status: notesDialog.status, notes: notesDialog.notes }
            : a
        )
      );
      setSnackbar({ open: true, message: 'Application updated!', severity: 'success' });
      setNotesDialog({ open: false, appId: null, status: '', notes: '' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to update application.',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/hr/manage-jobs')} sx={{ mb: 2 }} color="inherit">
        Back to Jobs
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          Applications
        </Typography>
        {job && (
          <Typography variant="body1" color="text.secondary">
            {job.title} &mdash; {applications.length} applicant{applications.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {applications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ textAlign: 'center', py: 8, border: '1px dashed', borderColor: 'divider' }}
        >
          <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>No applications yet</Typography>
          <Typography variant="body2" color="text.disabled">
            Applications will appear here once candidates apply
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Expected Salary</TableCell>
                <TableCell>Cover Letter</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => {
                const isExpanded = expandedId === app.id;
                const applicant = app.applicant || app.candidate || {};
                const name = `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() || applicant.username || 'Applicant';
                const email = applicant.email || '';
                return (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{name}</Typography>
                      {email && (
                        <Typography variant="caption" color="text.secondary">{email}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(app.applied_at || app.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {app.expected_salary
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(app.expected_salary)
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      {app.cover_letter ? (
                        <Box>
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                            {isExpanded
                              ? app.cover_letter
                              : `${app.cover_letter.slice(0, 100)}${app.cover_letter.length > 100 ? '...' : ''}`}
                          </Typography>
                          {app.cover_letter.length > 100 && (
                            <IconButton
                              size="small"
                              onClick={() => setExpandedId(isExpanded ? null : app.id)}
                            >
                              {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </IconButton>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">No cover letter</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={app.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openStatusUpdate(app)}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Update status dialog */}
      <Dialog
        open={notesDialog.open}
        onClose={() => setNotesDialog({ open: false, appId: null, status: '', notes: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Update Application Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <Select
              value={notesDialog.status}
              onChange={(e) => setNotesDialog((p) => ({ ...p, status: e.target.value }))}
            >
              {APPLICATION_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  <StatusChip status={s} sx={{ cursor: 'pointer' }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            value={notesDialog.notes}
            onChange={(e) => setNotesDialog((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Add notes for this application..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setNotesDialog({ open: false, appId: null, status: '', notes: '' })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={updating}
            startIcon={updating ? <CircularProgress size={16} /> : null}
          >
            {updating ? 'Updating...' : 'Update'}
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

export default JobApplications;
