// Admin pages public header/footer ke baghair khulti hain; baqi har page shared layout use karta hai.
import '../styles/globals.css';
import SiteLayout from '../components/SiteLayout';
import { useRouter } from 'next/router';

export default function SchoolApp({ Component, pageProps }) {
  const router = useRouter();
  if (router.pathname === '/admin' || router.pathname.startsWith('/admin/')) {
    return <Component {...pageProps} />;
  }
  return <SiteLayout><Component {...pageProps} /></SiteLayout>;
}
