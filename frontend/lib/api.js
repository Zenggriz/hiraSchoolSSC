const productionApiUrl = 'https://backend.hiraschoolssc.com';

// Local dev mein Next.js same-origin proxy use karta hai; production mein deployed API direct call hoti hai.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'development' ? '' : productionApiUrl)
).replace(/\/+$/, '');

export function getApiErrorMessage(error, fallback) {
  if (error.response?.data?.message) return error.response.data.message;
  if (!error.response) {
    const endpoint = API_URL || 'the local API proxy';
    return `Cannot connect to ${endpoint}. Check that the backend is running and allows this website's domain.`;
  }
  return error.message || fallback;
}
