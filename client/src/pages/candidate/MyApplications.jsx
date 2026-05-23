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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { getMyApplications, withdrawApplication } from '../../api/jobs';
import { getErrorMessage } from '../../api/utils';
import StatusChip from '../../components/StatusChip';
import PageLoader from '../../components/PageLoader';
import { useNavigate } from 'react-router-dom';

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawId, setWithdrawId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await getMyApplications();
      const data = res.data?.results || res.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load applications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await withdrawApplication(withdrawId);
      setSnackbar({ open: true, message: 'Application withdrawn.', severity: 'info' });
      setWithdrawId(null);
      fetchApplications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Failed to withdraw.'),
        severity: 'error',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>My Applications</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Track the status of your job applications
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {applications.length === 0 ? (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 8, border: '1px dashed', borderColor: 'divider' }}>
          <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>No applications yet</Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            Start applying to jobs to see your applications here
          </Typography>
          <Button variant="contained" onClick={() => navigate('/jobs')}>
            Browse Jobs
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      onClick={() => navigate(`/jobs/${app.job.id}`)}
                    >
                      {app.job.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {app.job.company.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(app.applied_at || app.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={app.status} />
                  </TableCell>
                  <TableCell>
                    {(app.status === 'pending' || app.status === 'reviewing') && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setWithdrawId(app.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirm withdraw dialog */}
      <Dialog open={Boolean(withdrawId)} onClose={() => setWithdrawId(null)}>
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to withdraw this application? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawId(null)} color="inherit">Cancel</Button>
          <Button
            onClick={handleWithdraw}
            color="error"
            variant="contained"
            disabled={withdrawing}
          >
            {withdrawing ? 'Withdrawing...' : 'Withdraw'}
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

export default MyApplications;
