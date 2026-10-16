const localApiUrl = 'http://localhost:5000';
const productionApiUrl = 'https://backend.hiraschoolssc.com';

// Local dev mein local Express server use hota hai; Vercel par deployed API default hai.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'development' ? localApiUrl : productionApiUrl)
).replace(/\/+$/, '');

export function getApiErrorMessage(error, fallback) {
  if (error.response?.data?.message) return error.response.data.message;
  if (!error.response) {
    return `Cannot connect to the school API at ${API_URL}. Check that the backend is running and allows this website's domain.`;
  }
  return error.message || fallback;
}
