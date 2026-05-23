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
  CircularProgress,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { createCompany, updateCompany, getMyCompanies } from '../../api/companies';
import PageLoader from '../../components/PageLoader';

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001+',
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  website: '',
  industry: '',
  size: '',
  founded_year: '',
  headquarters: '',
  linkedin_url: '',
};

const CompanySetup = () => {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await getMyCompanies();
        const list = res.data?.results || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const c = list[0];
          setCompany(c);
          setForm({
            name: c.name || '',
            slug: c.slug || '',
            description: c.description || '',
            website: c.website || '',
            industry: c.industry || '',
            size: c.size || '',
            founded_year: c.founded_year ?? '',
            headquarters: c.headquarters || '',
            linkedin_url: c.linkedin_url || '',
          });
        }
      } catch {
        // No company yet
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === 'name' && !company) updated.slug = slugify(value);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Company name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        founded_year: form.founded_year !== '' ? parseInt(form.founded_year) : undefined,
      };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });

      if (company) {
        const res = await updateCompany(company.id, payload);
        setCompany(res.data);
        setSnackbar({ open: true, message: 'Company updated successfully!', severity: 'success' });
        setEditing(false);
      } else {
        const res = await createCompany(payload);
        setCompany(res.data);
        setSnackbar({ open: true, message: 'Company created successfully!', severity: 'success' });
      }
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        setError(msg);
      } else {
        setError('Failed to save company.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const isViewMode = company && !editing;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>
          {company ? 'Company Profile' : 'Setup Your Company'}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {company
          ? 'Manage your company information that candidates will see'
          : 'Create your company profile to start posting jobs'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}

      {isViewMode ? (
        /* View mode */
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>{company.name}</Typography>
            <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {[
              { label: 'Industry', value: company.industry },
              { label: 'Company Size', value: company.size },
              { label: 'Founded Year', value: company.founded_year },
              { label: 'Headquarters', value: company.headquarters },
              { label: 'Website', value: company.website, link: true },
              { label: 'LinkedIn', value: company.linkedin_url, link: true },
            ].map((item) => item.value ? (
              <Grid item xs={12} sm={6} key={item.label}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  {item.label.toUpperCase()}
                </Typography>
                {item.link ? (
                  <Typography
                    variant="body2"
                    component="a"
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {item.value}
                  </Typography>
                ) : (
                  <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                )}
              </Grid>
            ) : null)}
            {company.description && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  DESCRIPTION
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7, mt: 0.3 }}>
                  {company.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      ) : (
        /* Edit/Create form */
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Company Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth required
                  label="Company Name"
                  name="name"
                  value={form.name}
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
                  helperText="URL-friendly name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={4}
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your company, mission, and culture..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. Software, Finance, Healthcare"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Company Size</InputLabel>
                  <Select name="size" value={form.size} onChange={handleChange} label="Company Size">
                    <MenuItem value="">Select Size</MenuItem>
                    {COMPANY_SIZES.map((s) => (
                      <MenuItem key={s} value={s}>{s} employees</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Founded Year"
                  name="founded_year"
                  type="number"
                  value={form.founded_year}
                  onChange={handleChange}
                  inputProps={{ min: 1800, max: new Date().getFullYear() }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Headquarters"
                  name="headquarters"
                  value={form.headquarters}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/..."
                />
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {company && (
              <Button variant="outlined" onClick={() => { setEditing(false); setError(''); }} disabled={saving}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={16} /> : company ? <SaveIcon /> : <AddIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : company ? 'Save Changes' : 'Create Company'}
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

export default CompanySetup;
