// Admin pages public header/footer ke baghair khulti hain; baqi har page shared layout use karta hai.
import '../styles/globals.css';
import Head from 'next/head';
import SiteLayout from '../components/SiteLayout';
import { useRouter } from 'next/router';

export default function SchoolApp({ Component, pageProps }) {
  const router = useRouter();
  const page = (
    <>
      <Head>
        <title>Hira School Shamim Saeed Campus | Sukkur</title>
        <meta
          name="description"
          content="Hira School Shamim Saeed Campus in Sukkur offers quality education, Islamic Tarbiyah, and evening academy classes."
        />
        <meta property="og:site_name" content="Hira School Shamim Saeed Campus" />
      </Head>
      <Component {...pageProps} />
    </>
  );
  if (router.pathname === '/admin' || router.pathname.startsWith('/admin/')) {
    return page;
  }
  return <SiteLayout>{page}</SiteLayout>;
}
