// src/lib/fees.js
import axios from './axios';

// Enroll a student with scheme + schedule generation
export const enroll = (payload, token) => {
  return axios.post('/enrollments/enroll', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Record a payment for a specific schedule item (immutable schedule)
export const postPayment = (scheduleId, amount, mode = 'CASH', token) => {
  return axios.post('/payments', { scheduleId, amount, mode }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Reminder logs for admin/student visibility
export const getReminderLogs = (params, token) => {
  return axios.get('/reminders/logs', {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Reports for dashboard cards
export const getReportSummary = (token) => {
  return axios.get('/reports/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getUpcomingDues = (days, token) => {
  return axios.get('/reports/upcoming', {
    params: { days },
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getOverdueDues = (token) => {
  return axios.get('/reports/overdue', {
    headers: { Authorization: `Bearer ${token}` }
  });
};
