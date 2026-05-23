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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { createJob, getSkills, getCategories } from '../../api/jobs';
import { getMyCompanies } from '../../api/companies';
import { getErrorMessage } from '../../api/utils';

const JOB_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'manager'];
const STATUSES = ['active', 'draft', 'closed'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const fmt = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const defaultForm = {
  title: '',
  slug: '',
  description: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  job_type: '',
  work_mode: '',
  experience_level: '',
  status: 'active',
  company: '',
  location: '',
  salary_min: '',
  salary_max: '',
  currency: 'USD',
  application_deadline: '',
  category: '',
};

const PostJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skillsRes, catsRes, compsRes] = await Promise.all([
          getSkills().catch(() => ({ data: [] })),
          getCategories().catch(() => ({ data: [] })),
          getMyCompanies().catch(() => ({ data: [] })),
        ]);
        setSkills(skillsRes.data?.results || skillsRes.data || []);
        setCategories(catsRes.data?.results || catsRes.data || []);
        const compList = compsRes.data?.results || compsRes.data || [];
        setCompanies(Array.isArray(compList) ? compList : []);
      } catch {
        setError('Failed to load form data.');
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === 'title') updated.slug = slugify(value);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.job_type || !form.work_mode) {
      setError('Please fill in Title, Description, Job Type and Work Mode.');
      return;
    }
    if (!form.company) {
      setError('Please select a company. Create one first under Company Setup if needed.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Map form field names → backend schema field names
      const payload = {
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: form.description,
        requirements: form.requirements || '',
        responsibilities: form.responsibilities || '',
        benefits: form.benefits || '',
        job_type: form.job_type,
        work_mode: form.work_mode,
        experience_level: form.experience_level || 'mid',
        status: form.status || 'active',
        company_id: Number(form.company),
        category_id: form.category ? Number(form.category) : undefined,
        location: form.location || '',
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        salary_currency: form.currency || 'USD',
        application_deadline: form.application_deadline || undefined,
        skill_ids: selectedSkills.map((s) => s.id),
      };
      // Drop undefined values
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
      });
      await createJob(payload);
      setSnackbar({ open: true, message: 'Job posted successfully!', severity: 'success' });
      setTimeout(() => navigate('/hr/manage-jobs'), 1200);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to post job. Please check all fields and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }} color="inherit">
        Back
      </Button>

      <Typography variant="h4" fontWeight={700} mb={1}>Post a New Job</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Fill in the details below to attract the best candidates
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}

      {dataLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Basic Info */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Basic Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth required
                  label="Job Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Slug"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth required multiline rows={5}
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the role, company culture, and what makes this job unique..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={4}
                  label="Requirements"
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  placeholder="List qualifications and requirements..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={4}
                  label="Responsibilities"
                  name="responsibilities"
                  value={form.responsibilities}
                  onChange={handleChange}
                  placeholder="List key responsibilities..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={3}
                  label="Benefits"
                  name="benefits"
                  value={form.benefits}
                  onChange={handleChange}
                  placeholder="Health insurance, remote work, equity..."
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Job Details */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Job Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Job Type</InputLabel>
                  <Select name="job_type" value={form.job_type} onChange={handleChange} label="Job Type">
                    {JOB_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>{fmt(t)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Work Mode</InputLabel>
                  <Select name="work_mode" value={form.work_mode} onChange={handleChange} label="Work Mode">
                    {WORK_MODES.map((m) => (
                      <MenuItem key={m} value={m}>{fmt(m)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Experience Level</InputLabel>
                  <Select name="experience_level" value={form.experience_level} onChange={handleChange} label="Experience Level">
                    <MenuItem value="">Any Level</MenuItem>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <MenuItem key={l} value={l}>{fmt(l)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={form.status} onChange={handleChange} label="Status">
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>{fmt(s)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Company</InputLabel>
                  <Select name="company" value={form.company} onChange={handleChange} label="Company">
                    <MenuItem value="">Select Company</MenuItem>
                    {companies.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select name="category" value={form.category} onChange={handleChange} label="Category">
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Salary */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Compensation</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select name="currency" value={form.currency} onChange={handleChange} label="Currency">
                    {CURRENCIES.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Salary Min"
                  name="salary_min"
                  type="number"
                  value={form.salary_min}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Salary Max"
                  name="salary_max"
                  type="number"
                  value={form.salary_max}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  name="application_deadline"
                  type="date"
                  value={form.application_deadline}
                  onChange={handleChange}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: { notched: true },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Skills */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Skills Required</Typography>
            <Divider sx={{ mb: 2 }} />
            <Autocomplete
              multiple
              options={skills}
              getOptionLabel={(opt) => opt.name || opt}
              value={selectedSkills}
              onChange={(_, val) => setSelectedSkills(val)}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              renderTags={(val, getTagProps) =>
                val.map((opt, i) => (
                  <Chip key={opt.id} label={opt.name} size="small" color="primary" {...getTagProps({ index: i })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Select Skills" placeholder="Search and add skills..." />
              )}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PostJob;
