import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  // Application statuses
  pending: { label: 'Pending', color: 'warning' },
  reviewing: { label: 'Reviewing', color: 'info' },
  shortlisted: { label: 'Shortlisted', color: 'primary' },
  interview: { label: 'Interview', color: 'secondary' },
  offered: { label: 'Offered', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  withdrawn: { label: 'Withdrawn', color: 'default' },
  // Job statuses
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  closed: { label: 'Closed', color: 'error' },
  draft: { label: 'Draft', color: 'warning' },
  // Job types
  full_time: { label: 'Full Time', color: 'primary' },
  part_time: { label: 'Part Time', color: 'secondary' },
  contract: { label: 'Contract', color: 'info' },
  freelance: { label: 'Freelance', color: 'warning' },
  internship: { label: 'Internship', color: 'success' },
  // Work modes
  onsite: { label: 'On-site', color: 'default' },
  remote: { label: 'Remote', color: 'success' },
  hybrid: { label: 'Hybrid', color: 'info' },
  // Experience levels
  entry: { label: 'Entry Level', color: 'success' },
  junior: { label: 'Junior', color: 'info' },
  mid: { label: 'Mid Level', color: 'primary' },
  senior: { label: 'Senior', color: 'secondary' },
  lead: { label: 'Lead', color: 'warning' },
  manager: { label: 'Manager', color: 'error' },
};

const StatusChip = ({ status, size = 'small', ...props }) => {
  const config = statusConfig[status] || { label: status, color: 'default' };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
      {...props}
    />
  );
};

export default StatusChip;
