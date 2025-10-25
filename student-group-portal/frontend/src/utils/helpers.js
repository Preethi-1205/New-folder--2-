import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (dueDate) => {
  return isBefore(new Date(dueDate), new Date());
};

export const isDueSoon = (dueDate, days = 3) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = (due - now) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= days;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'badge-warning',
    submitted: 'badge-info',
    graded: 'badge-success',
  };
  return colors[status] || 'badge-info';
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const calculatePercentage = (obtained, total) => {
  if (!total) return 0;
  return Math.round((obtained / total) * 100);
};
