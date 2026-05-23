import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { getMyJobs, getJobApplications } from '../../api/jobs';
import StatusChip from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={1}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
            {title.toUpperCase()}
          </Typography>
          <Typography variant="h3" fontWeight={700} color={color} lineHeight={1}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}.50`,
            borderRadius: 2,
            p: 1.5,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const HRDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalApps: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsRes = await getMyJobs();
        const jobList = jobsRes.data?.results || jobsRes.data || [];
        const arr = Array.isArray(jobList) ? jobList : [];
        setJobs(arr.slice(0, 10));

        const active = arr.filter((j) => j.status === 'active').length;

        // Try to get application counts
        let totalApps = 0;
        let pending = 0;
        for (const job of arr.slice(0, 5)) {
          try {
            const appsRes = await getJobApplications(job.id);
            const apps = appsRes.data?.results || appsRes.data || [];
            totalApps += apps.length;
            pending += apps.filter((a) => a.status === 'pending').length;
          } catch {
            // ignore per-job error
          }
        }

        setStats({
          total: arr.length,
          active,
          totalApps,
          pending,
        });
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            Welcome back, {user?.first_name || 'HR'}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here&apos;s what&apos;s happening with your job postings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/hr/post-job')}
        >
          Post New Job
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Jobs Posted"
            value={loading ? '-' : stats.total}
            icon={<WorkIcon />}
            color="primary.main"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Jobs"
            value={loading ? '-' : stats.active}
            icon={<CheckCircleIcon />}
            color="success.main"
            subtitle="Currently open"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Applications"
            value={loading ? '-' : stats.totalApps}
            icon={<PeopleIcon />}
            color="info.main"
            subtitle="Across all jobs"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Reviews"
            value={loading ? '-' : stats.pending}
            icon={<PendingActionsIcon />}
            color="warning.main"
            subtitle="Awaiting action"
          />
        </Grid>
      </Grid>

      {/* Recent Jobs */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Recent Jobs</Typography>
          <Button size="small" onClick={() => navigate('/hr/manage-jobs')}>
            View All
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <WorkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" mb={2}>No jobs posted yet</Typography>
            <Button variant="contained" onClick={() => navigate('/hr/post-job')}>
              Post Your First Job
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{job.title}</Typography>
                    </TableCell>
                    <TableCell><StatusChip status={job.status} /></TableCell>
                    <TableCell>
                      <StatusChip status={job.job_type} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(job.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/hr/jobs/${job.id}/applications`)}
                      >
                        View Apps
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default HRDashboard;
