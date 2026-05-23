/**
 * Extracts a displayable string from an Axios error.
 * Handles both plain {detail: "string"} and Pydantic 422 {detail: [{msg, loc, type}]}.
 */
export const getErrorMessage = (err, fallback = 'Something went wrong.') => {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (Array.isArray(detail)) return detail.map((e) => e.msg ?? JSON.stringify(e)).join(', ');
  if (typeof detail === 'string') return detail;
  return fallback;
};
