import React from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useNavigate } from 'react-router-dom';
import StatusChip from './StatusChip';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return null;
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
};

const JobCard = ({ job, actionButton, saved = false, onToggleSave }) => {
  const navigate = useNavigate();
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const companyName = job.company?.name || job.company_name || 'Company';

  const cardContent = (
    <CardContent sx={{ p: 2.5, pb: actionButton ? 1.5 : 2.5 }}>
      {/* Title row — leave right padding so the absolute bookmark button doesn't overlap */}
      <Box sx={{ pr: onToggleSave ? 4 : 0, mb: 1 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
          {job.title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {companyName}
        </Typography>
      </Box>

      {job.location && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {job.location}
          </Typography>
        </Box>
      )}

      <Stack direction="row" flexWrap="wrap" sx={{ mb: 1.5, gap: 0.5 }}>
        {job.job_type && <StatusChip status={job.job_type} />}
        {job.work_mode && <StatusChip status={job.work_mode} />}
        {job.experience_level && <StatusChip status={job.experience_level} />}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {salary ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" color="success.main" fontWeight={600}>
              {salary}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">Salary not specified</Typography>
        )}
        {job.created_at && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              {formatDate(job.created_at)}
            </Typography>
          </Box>
        )}
      </Box>

      {actionButton && (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          {actionButton}
        </Box>
      )}
    </CardContent>
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Bookmark button — sits outside CardActionArea so it doesn't trigger navigation */}
      {onToggleSave && (
        <Tooltip title={saved ? 'Remove from saved' : 'Save job'} placement="top">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onToggleSave(job.id, saved); }}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              color: saved ? 'primary.main' : 'text.disabled',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {saved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

      {actionButton ? (
        <Box sx={{ flex: 1 }}>{cardContent}</Box>
      ) : (
        <CardActionArea onClick={() => navigate(`/jobs/${job.id}`)} sx={{ flex: 1, alignItems: 'flex-start' }}>
          {cardContent}
        </CardActionArea>
      )}
    </Card>
  );
};

export default JobCard;
