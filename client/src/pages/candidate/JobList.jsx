import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import WorkOffIcon from '@mui/icons-material/WorkOff';
import { getJobs, getSavedJobs, saveJob, unsaveJob } from '../../api/jobs';
import JobCard from '../../components/JobCard';
import { useAuth } from '../../context/AuthContext';

const JOB_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

const WORK_MODES = [
  { value: '', label: 'All Modes' },
  { value: 'onsite', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const EXPERIENCE_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
];

const PAGE_SIZE = 12;

const defaultFilters = {
  search: '',
  job_type: '',
  work_mode: '',
  experience_level: '',
  location: '',
  salary_min: '',
  salary_max: '',
};

const selectSx = { minWidth: 130 };

const JobList = () => {
  const { user } = useAuth();
  const isCandidate = user?.role === 'job_seeker';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [savedIds, setSavedIds] = useState(new Set());

  const fetchJobs = useCallback(async (f, p) => {
    setLoading(true);
    setError('');
    try {
      const params = { ...f, page: p, page_size: PAGE_SIZE };
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null || params[k] === undefined) delete params[k];
      });
      const res = await getJobs(params);
      if (res.data?.results) {
        setJobs(res.data.results);
        setTotal(res.data.count || res.data.results.length);
      } else if (Array.isArray(res.data)) {
        setJobs(res.data);
        setTotal(res.data.length);
      } else {
        setJobs([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(appliedFilters, page);
  }, [appliedFilters, page, fetchJobs]);

  // Fetch saved job IDs once when a candidate is logged in
  useEffect(() => {
    if (!isCandidate) return;
    getSavedJobs()
      .then((res) => {
        const ids = (Array.isArray(res.data) ? res.data : []).map((s) => s.job_id);
        setSavedIds(new Set(ids));
      })
      .catch(() => {});
  }, [isCandidate]);

  const handleToggleSave = async (jobId, isSaved) => {
    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(jobId) : next.add(jobId);
      return next;
    });
    try {
      isSaved ? await unsaveJob(jobId) : await saveJob(jobId);
    } catch {
      // Revert on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        isSaved ? next.add(jobId) : next.delete(jobId);
        return next;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  const activeCount = Object.values(appliedFilters).filter(Boolean).length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 5, px: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            Find Your Dream Job
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Explore {total > 0 ? `${total} ` : ''}opportunities from top companies
          </Typography>
        </Box>
      </Box>

      {/* Horizontal filter bar */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', py: 2, px: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1.5}
            alignItems="center"
          >
            {/* Search */}
            <TextField
              placeholder="Job title, keyword..."
              name="search"
              value={filters.search}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              size="small"
              sx={{ minWidth: 220, flex: '1 1 220px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Location */}
            <TextField
              placeholder="Location"
              name="location"
              value={filters.location}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              size="small"
              sx={{ minWidth: 150, flex: '1 1 150px' }}
            />

            {/* Job Type */}
            <FormControl size="small" sx={selectSx}>
              <InputLabel>Job Type</InputLabel>
              <Select name="job_type" value={filters.job_type} onChange={handleChange} label="Job Type">
                {JOB_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Work Mode */}
            <FormControl size="small" sx={selectSx}>
              <InputLabel>Work Mode</InputLabel>
              <Select name="work_mode" value={filters.work_mode} onChange={handleChange} label="Work Mode">
                {WORK_MODES.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Experience */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Experience</InputLabel>
              <Select name="experience_level" value={filters.experience_level} onChange={handleChange} label="Experience">
                {EXPERIENCE_LEVELS.map((l) => (
                  <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Salary min/max */}
            <TextField
              placeholder="Min salary"
              name="salary_min"
              type="number"
              value={filters.salary_min}
              onChange={handleChange}
              size="small"
              sx={{ width: 110 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              placeholder="Max salary"
              name="salary_max"
              type="number"
              value={filters.salary_max}
              onChange={handleChange}
              size="small"
              sx={{ width: 110 }}
              inputProps={{ min: 0 }}
            />

            {/* Actions */}
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleApply}
              size="medium"
            >
              Search
            </Button>

            {activeCount > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={handleReset}
                size="medium"
              >
                Clear
                <Chip
                  label={activeCount}
                  size="small"
                  color="error"
                  sx={{ ml: 0.5, height: 18, fontSize: '0.7rem' }}
                />
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Job results */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Searching...' : `${total} job${total !== 1 ? 's' : ''} found`}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <WorkOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>No jobs found</Typography>
            <Typography variant="body2" color="text.disabled" mb={2}>
              Try adjusting your filters or search terms
            </Typography>
            <Button variant="outlined" onClick={handleReset}>Clear Filters</Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {jobs.map((job) => (
                <Grid item xs={12} sm={6} lg={4} key={job.id}>
                  <JobCard
                    job={job}
                    saved={savedIds.has(job.id)}
                    onToggleSave={isCandidate ? handleToggleSave : undefined}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => { setPage(v); window.scrollTo(0, 0); }}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default JobList;
