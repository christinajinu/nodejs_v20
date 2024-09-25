export const createResponse = (status, message, data = null, error = null) => ({
  status,
  message,
  data,
  error,
});

// a helper function to send an error response
export const sendError = (res, status, message) =>
  res.status(status).json({ status: 'error', message });

// a helper function to send an warning response
export const sendWarning = (res, status, message) =>
  res.status(status).json({ status: 'warning', message });
// a helper function to send an success response
export const sendSuccess = (res, status, message, data) =>
  res.status(status).json({ status: 'success', message, data });
