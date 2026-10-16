const localApiUrl = 'http://localhost:5000';
const productionApiUrl = 'https://backend.hiraschoolssc.com';

// Local dev mein local Express server use hota hai; Vercel par deployed API default hai.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'development' ? localApiUrl : productionApiUrl)
).replace(/\/+$/, '');
