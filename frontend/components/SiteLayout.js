// Public pages ke shared header/footer aur CMS settings fetch ka zimma is layout ka hai.
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_URL, getApiErrorMessage } from '../lib/api';

const DEFAULT_SETTINGS = {
  liveLocation: 'https://maps.app.goo.gl/TFA4UbDuUjqmPwWf6',
  gallery: [],
  galleryManaged: false,
  content: {},
  galleryLayout: { mode: 'grid', columns: 3 },
  loaded: false,
  error: '',
};
const SiteSettingsContext = createContext(DEFAULT_SETTINGS);

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

function SchoolHeader({ settings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const router = useRouter();
  const copy = settings.content;

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 10);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    if (router.pathname !== '/') return undefined;
    const sections = document.querySelectorAll('main section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [router.pathname]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <a className="skip-link" href="#main-content">{copy.skipLinkLabel}</a>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="top-info">
            <span><i className="fa-solid fa-location-dot" />{settings.liveLocation}</span>
            <span><i className="fa-brands fa-whatsapp" /><a href={`https://wa.me/${copy.whatsappInternational}`} target="_blank" rel="noopener noreferrer">{copy.whatsapp}</a></span>
            <span><i className="fa-solid fa-phone" /><a href={`tel:${copy.phoneOneLink}`}>{copy.phoneOne}</a> / <a href={`tel:${copy.phoneTwoLink}`}>{copy.phoneTwo}</a></span>
            <span><i className="fa-solid fa-envelope" /><a href={`mailto:${copy.email}`}>{copy.email}</a></span>
          </div>
          <Link className="admission-pill" href="/admission">{copy.admissionBanner}</Link>
        </div>
      </div>
      <header className={`header${scrolled ? ' scrolled' : ''}`} id="siteHeader">
        <div className="container nav">
          <Link aria-label={copy.siteName} className="brand" href="/">
            <Image
              alt={copy.siteName}
              className="brand-mark official-logo"
              src={copy.images.logo}
              width={1813}
              height={518}
              priority
              unoptimized={copy.images.logo.startsWith('http')}
            />
          </Link>
          <nav aria-label={copy.primaryNavigationLabel}>
            <ul className="nav-links">
              {copy.navigationLinks.map(({ label, href }) => {
                const target = href.startsWith('#') && router.pathname !== '/' ? `/${href}` : href;
                return (
                  <li key={label}>
                    {target.startsWith('/')
                      ? <Link href={target}>{label}</Link>
                      : <a className={activeSection === target.slice(1) ? 'active' : undefined} href={target}>{label}</a>}
                  </li>
                );
              })}
              <li><Link className="apply" href="/admission">{copy.navApplyLabel}</Link></li>
            </ul>
          </nav>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="mobile-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
        <nav className={`mobile-menu${menuOpen ? ' active' : ''}`} aria-label={copy.mobileNavigationLabel}>
          {copy.navigationLinks.map(({ label, href }) => {
            const target = href.startsWith('#') && router.pathname !== '/' ? `/${href}` : href;
            return target.startsWith('/')
              ? <Link href={target} key={label} onClick={closeMenu}>{label}</Link>
              : <a href={target} key={label} onClick={closeMenu}>{label}</a>;
          })}
          <Link className="apply-mobile" href="/admission" onClick={closeMenu}>{copy.navApplyLabel}</Link>
        </nav>
      </header>
    </>
  );
}

function SchoolFooter({ settings }) {
  const copy = settings.content;
  return (
    <>
      <a aria-label={copy.footerWhatsAppLabel} className="floating-wa" href={`https://wa.me/${copy.whatsappInternational}`} target="_blank" rel="noopener noreferrer">
        <i className="fa-brands fa-whatsapp" />
      </a>
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link aria-label={copy.siteName} className="brand" href="/">
                <Image
                  alt={copy.siteName}
                  className="brand-mark official-logo footer-logo"
                  src={copy.images.logo}
                  width={1813}
                  height={518}
                  unoptimized={copy.images.logo.startsWith('http')}
                />
              </Link>
              <p>{copy.footerDescription}</p>
              <div className="socials">
                {copy.socialLinks.map((social) => <a aria-label={social.label} href={social.url} key={social.label} target="_blank" rel="noopener noreferrer"><i className={`fa-brands ${social.icon}`} /></a>)}
              </div>
            </div>
            <div>
              <h3 className="footer-title">{copy.footerQuickLinksTitle}</h3>
              <ul className="footer-links">
                {copy.navigationLinks.filter(({ href }) => href.startsWith('#')).map(({ label, href }) => (
                  <li key={label}><Link href={`/${href}`}>{label}</Link></li>
                ))}
                {copy.footerResultLink && <li><Link href="/results">{copy.footerResultLink}</Link></li>}
              </ul>
            </div>
            <div>
              <h3 className="footer-title">{copy.footerAcademicsTitle}</h3>
              <ul className="footer-links">
                {copy.footerAcademicsLinks.map((item) => <li key={item.label}><Link href={item.href}>{item.label}</Link></li>)}
              </ul>
            </div>
            <div className="footer-contact">
              <h3 className="footer-title">{copy.footerContactTitle}</h3>
              <p><i className="fa-solid fa-location-dot" />{settings.liveLocation}</p>
              <p><i className="fa-brands fa-whatsapp" /><a href={`https://wa.me/${copy.whatsappInternational}`} target="_blank" rel="noopener noreferrer">{copy.whatsapp}</a></p>
              <p><i className="fa-solid fa-phone" /><a href={`tel:${copy.phoneOneLink}`}>{copy.phoneOne}</a> / <a href={`tel:${copy.phoneTwoLink}`}>{copy.phoneTwo}</a></p>
              <p><i className="fa-solid fa-envelope" /><a href={`mailto:${copy.email}`}>{copy.email}</a></p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>{copy.footerCopyright}</span>
            <span><Link href="/#contact">{copy.footerPrivacyLabel}</Link> | <Link href="/#contact">{copy.footerTermsLabel}</Link></span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function SiteLayout({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/api/config`)
      .then(({ data }) => {
        if (!active) return;
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          content: data.content && typeof data.content === 'object' ? data.content : {},
          loaded: true,
        });
      })
      .catch((error) => {
        if (!active) return;
        setSettings({
          ...DEFAULT_SETTINGS,
          loaded: true,
          error: getApiErrorMessage(error, 'Website content could not be loaded.'),
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      <Head>
        {settings.loaded && settings.content.description && <meta name="description" content={settings.content.description} />}
        <meta name="theme-color" content="#18245C" />
        <meta name="robots" content="index, follow" />
      </Head>
      {settings.loaded && !settings.error && <SchoolHeader settings={settings} />}
      {children}
      {settings.loaded && !settings.error && <SchoolFooter settings={settings} />}
    </SiteSettingsContext.Provider>
  );
}
