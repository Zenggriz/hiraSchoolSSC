// Admin ke har workspace ka form aur save action yahin se chalta hai, route ke mutabiq fields badalte hain.
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_URL } from '../lib/api';

const CLASSES = [
  'Playgroup',
  'Nursery',
  'KG',
  ...Array.from({ length: 10 }, (_, index) => `Class ${index + 1}`),
];
const SECTIONS = ['A', 'B', 'C', 'D'];
const CONTENT_FIELDS = [
  { section: 'Header & Hero', fields: [
    ['admissionBanner', 'Admissions banner (used across the website)'], ['navApplyLabel', 'Header apply button label'],
    ['heroLineOne', 'Hero title line 1'],
    ['heroLineTwo', 'Hero title line 2'], ['heroLineThree', 'Hero title line 3'], ['heroDescription', 'Hero description'],
    ['motto', 'School motto'], ['mottoDescription', 'Motto description'], ['heroApplyLabel', 'Apply button label'],
    ['heroWhatsAppLabel', 'WhatsApp button label'], ['heroImageAlt', 'Hero image description'],
  ] },
  { section: 'About Us', fields: [
    ['aboutEyebrow', 'Section label'], ['aboutTitle', 'Section heading'], ['aboutParagraphOne', 'First paragraph'],
    ['aboutParagraphTwo', 'Second paragraph'], ['aboutBadgeTitle', 'Image badge title'], ['aboutBadgeSubtitle', 'Image badge subtitle'],
    ['aboutImageAlt', 'Image description'],
  ] },
  { section: 'Why Choose Us', fields: [
    ['whyEyebrow', 'Section label'], ['whyTitle', 'Section heading'], ['whyDescription', 'Section description'],
  ] },
  { section: 'Academics', fields: [
    ['academicEyebrow', 'Section label'], ['academicTitle', 'Section heading'], ['academicDescription', 'Section description'],
  ] },
  { section: 'Academy', fields: [
    ['academyEyebrow', 'Section label'], ['academyTitle', 'Section heading'],
    ['academyDescription', 'Section description'], ['academySchedule', 'Class schedule'],
  ] },
  { section: 'Faculty', fields: [
    ['facultyEyebrow', 'Section label'], ['facultyTitle', 'Section heading'],
    ['facultyDescription', 'Section description'], ['facultySchoolLabel', 'School toggle label'],
    ['facultyAcademyLabel', 'Academy toggle label'],
  ] },
  { section: 'Facilities', fields: [
    ['facilitiesEyebrow', 'Section label'], ['facilitiesTitle', 'Section heading'], ['facilitiesDescription', 'Section description'],
  ] },
  { section: 'Activities', fields: [
    ['activitiesEyebrow', 'Section label'], ['activitiesTitle', 'Section heading'], ['activitiesDescription', 'Section description'],
  ] },
  { section: 'Gallery', fields: [
    ['galleryEyebrow', 'Section label'], ['galleryTitle', 'Section heading'], ['galleryDescription', 'Section description'],
    ['galleryEmptyMessage', 'Empty gallery message'],
  ] },
  { section: 'Leadership', fields: [
    ['leadershipEyebrow', 'Section label'], ['leadershipTitle', 'Section heading'], ['leadershipDescription', 'Section description'],
    ['leadershipLabel', 'Management label'], ['leadershipStatement', 'Message heading'], ['leadershipBody', 'Message text'],
    ['leadershipImageAlt', 'Leadership image description'],
  ] },
  { section: 'Admission Inquiry', fields: [
    ['admissionsTitle', 'Section heading'], ['admissionsDescription', 'Section description'],
    ['inquiryTitle', 'Form heading'], ['inquiryNameLabel', 'Name field label'], ['inquiryEmailLabel', 'Email field label'],
    ['inquiryWhatsAppTitle', 'WhatsApp contact label'], ['admissionsOfficeLabel', 'Admissions phone label'],
    ['campusAdminLabel', 'Campus phone label'], ['officialEmailLabel', 'Official email label'],
    ['inquiryPhoneLabel', 'Phone field label'], ['inquiryMessageLabel', 'Message field label'],
    ['inquirySubmitLabel', 'Submit button label'], ['inquiryAdmissionPrefix', 'Admission form prompt'],
    ['inquiryAdmissionAction', 'Admission form link label'], ['inquiryPlaceholderName', 'Name field placeholder'],
    ['inquiryPlaceholderEmail', 'Email field placeholder'], ['inquiryPlaceholderPhone', 'Phone field placeholder'],
    ['inquiryPlaceholderMessage', 'Message field placeholder'], ['inquirySendingLabel', 'Sending status text'],
    ['inquiryFallbackError', 'Inquiry error message'],
  ] },
  { section: 'Contact & Location', fields: [
    ['contactEyebrow', 'Section label'], ['contactTitle', 'Section heading'], ['contactDescription', 'Section description'],
    ['contactAddressLabel', 'Address label'], ['contactWhatsAppLabel', 'WhatsApp label'], ['contactPhoneLabel', 'Phone label'],
    ['contactEmailLabel', 'Email label'], ['directionsLabel', 'Directions link label'],
    ['mapTitle', 'Map accessible title'], ['description', 'Search engine description'],
    ['siteName', 'School name'], ['email', 'Contact email'], ['whatsapp', 'WhatsApp number'],
    ['whatsappInternational', 'WhatsApp number with country code'], ['phoneOne', 'Phone number 1'], ['phoneOneLink', 'Phone number 1 link format'],
    ['phoneTwo', 'Phone number 2'], ['phoneTwoLink', 'Phone number 2 link format'],
    ['mapEmbedUrl', 'Google Maps embed URL'], ['directionsUrl', 'Google Maps directions URL'],
  ] },
  { section: 'Footer & Call to Action', fields: [
    ['finalTitle', 'Call-to-action heading'], ['finalDescription', 'Call-to-action text'], ['applyNowLabel', 'Apply button label'],
    ['finalWhatsAppLabel', 'WhatsApp button label'], ['resultsLinkLabel', 'Results link label'],
    ['footerDescription', 'Footer description'], ['footerCopyright', 'Copyright text'],
    ['footerQuickLinksTitle', 'Quick links heading'], ['footerAcademicsTitle', 'Academics heading'],
    ['footerContactTitle', 'Contact heading'], ['footerResultLink', 'Results footer link label'],
    ['footerPrivacyLabel', 'Privacy link label'], ['footerTermsLabel', 'Terms link label'],
    ['footerWhatsAppLabel', 'Floating WhatsApp accessibility label'],
  ] },
];
const CONTENT_IMAGES = [
  ['logo', 'Header and footer logo'], ['hero', 'Hero image'], ['about', 'About section image'],
  ['activityOne', 'Activity image 1'], ['activityTwo', 'Activity image 2'], ['activityThree', 'Activity image 3'],
  ['activityFour', 'Activity image 4'], ['activityFive', 'Activity image 5'], ['leadership', 'Leadership image'],
];
const CONTENT_LISTS = [
  { key: 'trustItems', title: 'Hero highlights', fields: [['title', 'Title'], ['description', 'Description']] },
  { key: 'aboutHighlights', title: 'About highlights', fields: [['value', 'Highlight']] },
  { key: 'benefits', title: 'Why choose us cards', fields: [['title', 'Title'], ['description', 'Description']] },
  { key: 'academicStages', title: 'Academic stage cards', fields: [['title', 'Title'], ['classes', 'Classes'], ['description', 'Description']] },
  { key: 'facilities', title: 'Facility cards', fields: [['title', 'Title'], ['description', 'Description']] },
  { key: 'activities', title: 'Activity captions', fields: [['title', 'Caption'], ['imageAlt', 'Image description'], ['imageKey', 'Image slot']] },
  { key: 'galleryFilters', title: 'Gallery filter names', fields: [['value', 'Filter name']] },
  { key: 'leadershipPoints', title: 'Leadership highlights', fields: [['value', 'Highlight']] },
  { key: 'academyHighlights', title: 'Academy highlights', fields: [['value', 'Highlight']] },
  { key: 'academyPrograms', title: 'Academy programs', fields: [['title', 'Program'], ['description', 'Description']] },
  { key: 'schoolFaculty', title: 'School faculty', fields: [['name', 'Name'], ['designation', 'Designation'], ['imageKey', 'Photo slot']] },
  { key: 'academyFaculty', title: 'Academy faculty', fields: [['name', 'Name'], ['designation', 'Designation'], ['imageKey', 'Photo slot']] },
  { key: 'footerAcademicsLinks', title: 'Footer academic links', fields: [['label', 'Link label'], ['href', 'Link destination']] },
  { key: 'socialLinks', title: 'Social media links', fields: [['label', 'Network name'], ['url', 'Profile URL']] },
];
const ADMIN_PAGES = [
  { id: 'hero', label: 'Header & Hero', icon: '⌂', groups: ['Header & Hero'], lists: ['trustItems'] },
  { id: 'about', label: 'About Us', icon: '▤', groups: ['About Us'], lists: ['aboutHighlights'] },
  { id: 'why', label: 'Why Choose Us', icon: '✦', groups: ['Why Choose Us'], lists: ['benefits'] },
  { id: 'academics', label: 'Academics', icon: '▧', groups: ['Academics'], lists: ['academicStages'] },
  { id: 'academy', label: 'Academy', icon: '▧', groups: ['Academy'], lists: ['academyHighlights', 'academyPrograms'] },
  { id: 'faculty', label: 'Faculty', icon: '♙', groups: ['Faculty'], lists: ['schoolFaculty', 'academyFaculty'] },
  { id: 'facilities', label: 'Facilities', icon: '⌂', groups: ['Facilities'], lists: ['facilities'] },
  { id: 'activities', label: 'Activities', icon: '◉', groups: ['Activities'], lists: ['activities'] },
  { id: 'gallery', label: 'Gallery', icon: '▧', groups: ['Gallery'], lists: ['galleryFilters'] },
  { id: 'leadership', label: 'Leadership', icon: '♙', groups: ['Leadership'], lists: ['leadershipPoints'] },
  { id: 'inquiry', label: 'Admission Inquiry', icon: '✉', groups: ['Admission Inquiry'], lists: [] },
  { id: 'contact', label: 'Contact & Location', icon: '⌖', groups: ['Contact & Location'], lists: ['socialLinks'] },
  { id: 'footer', label: 'Footer & Call to Action', icon: '▱', groups: ['Footer & Call to Action'], lists: ['footerAcademicsLinks'] },
  { id: 'images', label: 'Website Images', icon: '▧', groups: [], lists: [] },
  { id: 'location', label: 'Campus Address', icon: '⌖', groups: [], lists: [] },
  { id: 'gallery-admin', label: 'Photo Gallery', icon: '▧', groups: [], lists: [] },
  { id: 'results', label: 'Class Results', icon: '▤', groups: [], lists: [] },
];

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'The request could not be completed.';
}

export default function AdminDashboard() {
  const router = useRouter();
  const sectionId = typeof router.query.section === 'string' ? router.query.section : '';
  const activePage = ADMIN_PAGES.find((page) => page.id === sectionId);
  const isDashboard = router.pathname === '/admin' && !sectionId;
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [settings, setSettings] = useState({ liveLocation: '', gallery: [] });
  const [contentDraft, setContentDraft] = useState({});
  const [results, setResults] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryCategory, setGalleryCategory] = useState('Campus');
  const [resultFile, setResultFile] = useState(null);
  const [resultSelection, setResultSelection] = useState({ className: 'Playgroup', section: 'A' });
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const galleryCategories = (contentDraft.galleryFilters || []).slice(1);
  const selectedGalleryCategory = galleryCategories.includes(galleryCategory)
    ? galleryCategory
    : galleryCategories[0] || '';

  const adminRequest = useCallback((accessToken, method, path, data, config = {}) => (
    axios({
      method,
      url: `${API_URL}${path}`,
      data,
      ...config,
      headers: {
        ...config.headers,
        // Admin token sirf protected request ke header mein jata hai, URL ya public settings mein kabhi nahi.
        Authorization: `Bearer ${accessToken}`,
      },
    })
  ), []);

  const loadDashboard = useCallback(async (accessToken) => {
    setErrorMessage('');
    try {
      await adminRequest(accessToken, 'get', '/api/admin/status');
      const [{ data: currentSettings }, { data: currentResults }] = await Promise.all([
        axios.get(`${API_URL}/api/config`),
        adminRequest(accessToken, 'get', '/api/admin/results'),
      ]);
      setToken(accessToken);
      setIsAuthenticated(true);
      setSettings(currentSettings);
      setLocationInput(currentSettings.liveLocation);
      setContentDraft(currentSettings.content || {});
      setResults(currentResults);
    } catch (error) {
      sessionStorage.removeItem('school-admin-token');
      setIsAuthenticated(false);
      setToken('');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsChecking(false);
    }
  }, [adminRequest]);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('school-admin-token');
    const timer = window.setTimeout(() => {
      if (savedToken) loadDashboard(savedToken);
      else setIsChecking(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  async function signIn(event) {
    event.preventDefault();
    setErrorMessage('');
    setBusyAction('login');
    try {
      await adminRequest(tokenInput, 'get', '/api/admin/status');
      sessionStorage.setItem('school-admin-token', tokenInput);
      await loadDashboard(tokenInput);
      setTokenInput('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsChecking(false);
    } finally {
      setBusyAction('');
    }
  }

  function signOut() {
    sessionStorage.removeItem('school-admin-token');
    setToken('');
    setIsAuthenticated(false);
    setSettings({ liveLocation: '', gallery: [] });
    setResults([]);
    setNotice('');
    setErrorMessage('');
  }

  async function saveLocation(event) {
    event.preventDefault();
    setBusyAction('location');
    setErrorMessage('');
    setNotice('');
    try {
      const { data } = await adminRequest(token, 'patch', '/api/admin/settings', {
        liveLocation: locationInput,
      });
      setSettings(data);
      setNotice('Location saved successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAction('');
    }
  }

  function updateContentField(key, value) {
    setContentDraft((current) => ({ ...current, [key]: value }));
  }

  function updateContentListItem(listKey, index, field, value) {
    setContentDraft((current) => {
      const items = [...(current[listKey] || [])];
      if (field === 'value') items[index] = value;
      else items[index] = { ...items[index], [field]: value };
      return { ...current, [listKey]: items };
    });
  }

  function addContentListItem(list) {
    const newItem = list.fields.length === 1 && list.fields[0][0] === 'value'
      ? ''
      : Object.fromEntries(list.fields.map(([field]) => [field, '']));
    if (list.key === 'activities') newItem.imageKey = 'activityOne';
    if (list.key === 'schoolFaculty' || list.key === 'academyFaculty') {
      const slotPrefix = list.key === 'schoolFaculty' ? 'schoolFaculty-' : 'academyFaculty-';
      const nextSlot = (contentDraft[list.key] || []).reduce((highest, member) => {
        const match = member.imageKey?.match(/-(\d+)$/);
        return match ? Math.max(highest, Number(match[1])) : highest;
      }, 0) + 1;
      newItem.imageKey = `${slotPrefix}${nextSlot}`;
    }
    const defaultIcons = {
      benefits: 'fa-star',
      academicStages: 'fa-book-open',
      facilities: 'fa-school',
      socialLinks: 'fa-globe',
    };
    if (defaultIcons[list.key]) newItem.icon = defaultIcons[list.key];
    setContentDraft((current) => ({ ...current, [list.key]: [...(current[list.key] || []), newItem] }));
  }

  function removeContentListItem(listKey, index) {
    setContentDraft((current) => ({
      ...current,
      [listKey]: (current[listKey] || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function saveWebsiteContent(event) {
    event.preventDefault();
    if (!activePage) return;
    setBusyAction('content');
    setErrorMessage('');
    setNotice('');

    try {
      const content = {};
      CONTENT_FIELDS
        .filter((group) => activePage.groups.includes(group.section))
        .forEach((group) => group.fields.forEach(([key]) => {
          content[key] = contentDraft[key];
        }));
      activePage.lists.forEach((listKey) => {
        content[listKey] = contentDraft[listKey] || [];
      });
      if (activePage.id === 'gallery') {
        content.galleryLayout = contentDraft.galleryLayout || 'grid';
        content.galleryColumns = contentDraft.galleryColumns || 3;
      }
      const { data } = await adminRequest(token, 'patch', '/api/admin/settings', { content });
      setSettings(data);
      setContentDraft(data.content || {});
      setNotice(`${activePage.label} saved successfully.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAction('');
    }
  }

  async function uploadContentImage(event, slot) {
    const image = event.target.files?.[0];
    if (!image) return;
    setBusyAction(`content-image-${slot}`);
    setErrorMessage('');
    setNotice('');
    const body = new FormData();
    body.append('image', image);
    try {
      const { data } = await adminRequest(token, 'post', `/api/admin/content-image/${slot}`, body);
      setSettings(data);
      setContentDraft((current) => ({
        ...(data.content || {}),
        ...current,
        images: data.content?.images || current.images || {},
      }));
      setNotice(`${CONTENT_IMAGES.find(([key]) => key === slot)?.[1] || 'Faculty photo'} updated.`);
      event.target.value = '';
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAction('');
    }
  }

  async function uploadGallery(event) {
    event.preventDefault();
    if (!galleryFiles.length) {
      setErrorMessage('Choose one or more images first.');
      return;
    }
    setBusyAction('gallery');
    setErrorMessage('');
    setNotice('');
    const body = new FormData();
    galleryFiles.forEach((file) => body.append('images', file));
    body.append('category', selectedGalleryCategory);
    try {
      const { data } = await adminRequest(token, 'post', '/api/admin/gallery', body);
      setSettings(data);
      setGalleryFiles([]);
      event.currentTarget.reset();
      setNotice('Gallery updated successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAction('');
    }
  }

  async function removeGalleryImage(imageId) {
    setBusyAction(`image-${imageId}`);
    setErrorMessage('');
    setNotice('');
    try {
      const { data } = await adminRequest(token, 'delete', `/api/admin/gallery/${imageId}`);
      setSettings(data);
      setNotice('Image removed from the gallery.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAction('');
    }
  }

  async function uploadResult(event) {
    event.preventDefault();
    if (!resultFile) {
      setErrorMessage('Choose a PDF result sheet first.');
      return;
    }
    setBusyAction('result');
    setErrorMessage('');
    setNotice('');
    const body = new FormData();
    body.append('className', resultSelection.className);
    body.append('section', resultSelection.section);
    body.append('file', resultFile);
    try {
      const { data } = await adminRequest(token, 'post', '/api/admin/upload-result', body);
      setResults((current) => [
        ...current.filter((item) => item.className !== data.className || item.section !== data.section),
        data,
      ].sort((first, second) => (
        first.className.localeCompare(second.className) || first.section.localeCompare(second.section)
      )));
      setResultFile(null);
      event.currentTarget.reset();
      setNotice(`Result sheet for ${data.className}, Section ${data.section} published.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAction('');
    }
  }

  async function removeResult(result) {
    const resultName = `${result.className}, Section ${result.section}`;
    if (!window.confirm(`Remove the ${resultName} PDF? This cannot be undone.`)) return;

    const action = `result-${result.className}-${result.section}`;
    setBusyAction(action);
    setErrorMessage('');
    setNotice('');
    try {
      const { data } = await adminRequest(
        token,
        'delete',
        `/api/admin/results/${encodeURIComponent(result.className)}/${encodeURIComponent(result.section)}`,
      );
      setResults((current) => current.filter((item) => (
        item.className !== result.className || item.section !== result.section
      )));
      setNotice(data.message);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAction('');
    }
  }

  return (
    <>
      <Head>
        <title>School Admin | Hira School Shamim Saeed Campus</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <Link className="admin-brand" href="/">School Admin<span>Hira School Shamim Saeed Campus</span></Link>
          <nav aria-label="Admin navigation">
            <Link className={isDashboard ? 'admin-nav-active' : ''} href="/admin">◫ <span>Dashboard</span></Link>
            <p>WEBSITE SECTIONS</p>
            {ADMIN_PAGES.map((page) => (
              <Link className={activePage?.id === page.id ? 'admin-nav-active' : ''} href={`/admin/${page.id}`} key={page.id}>
                {page.icon} <span>{page.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <Link href="/" className="admin-view-site">View website ↗</Link>
            <div className="admin-topbar-actions">
              <span>Administrator</span>
              {isAuthenticated && <button className="button button-outline button-small" type="button" onClick={signOut}>↪ &nbsp;Logout</button>}
            </div>
          </header>

          <main className="admin-content" id="dashboard">
            {!isAuthenticated && (isChecking || busyAction === 'login') ? (
              <div className="brand-preloader admin-preloader" role="status" aria-label="Signing in">
                <Image src="/images/hira-school-logo.png" alt="Hira School logo" width={360} height={110} priority unoptimized />
              </div>
            ) : !isAuthenticated ? (
              <section className="admin-login-card">
                <Image src="/images/hira-school-logo.png" alt="Hira School logo" width={240} height={80} unoptimized />
                <p className="eyebrow">SECURE SCHOOL ADMIN</p>
                <h1>Sign in to manage your website.</h1>
                <p>Enter the admin token configured by your server administrator.</p>
                <form onSubmit={signIn}>
                  <label>Admin token<input type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} autoComplete="current-password" required /></label>
                  {errorMessage && <p className="admin-alert admin-alert-error" role="alert">{errorMessage}</p>}
                  <button className="button button-full" type="submit" disabled={busyAction === 'login' || isChecking}>{busyAction === 'login' || isChecking ? 'Checking…' : 'Sign in'} <span aria-hidden="true">→</span></button>
                </form>
              </section>
            ) : (
              <>
                <div className="admin-page-heading">
                  <div>
                    <p className="admin-breadcrumb"><Link href="/admin">Dashboard</Link>{activePage && <> &nbsp;›&nbsp; Website &nbsp;›&nbsp; {activePage.label}</>}</p>
                    <h1>{activePage?.label || 'Website content'}</h1>
                    <p>{activePage ? `Manage ${activePage.label.toLowerCase()} settings for the public website.` : 'Choose a website section to edit its content, photos, or settings.'}</p>
                  </div>
                  <Link className="button" href="/" target="_blank" rel="noreferrer">View website ↗</Link>
                </div>
                {errorMessage && <p className="admin-alert admin-alert-error" role="alert">{errorMessage}</p>}
                {notice && <p className="admin-alert admin-alert-success" role="status">{notice}</p>}

                {isDashboard && (
                  <section className="admin-overview-grid">
                    {ADMIN_PAGES.map((page) => (
                      <Link className="admin-overview-card" href={`/admin/${page.id}`} key={page.id}>
                        <span>{page.icon}</span>
                        <strong>{page.label}</strong>
                        <small>Manage settings and content</small>
                      </Link>
                    ))}
                  </section>
                )}

                {activePage && (activePage.groups.length > 0 || activePage.lists.length > 0) && (
                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><p className="eyebrow">WEBSITE CONTENT</p><h2>{activePage.label}</h2></div><span className="admin-count">EDIT SECTION</span></div>
                    <p className="admin-help">Edit this section only. Save changes here without affecting other website sections.</p>
                    <form onSubmit={saveWebsiteContent}>
                    {CONTENT_FIELDS.filter((group) => activePage.groups.includes(group.section)).map((group) => (
                      <fieldset className="cms-fieldset" key={group.section}>
                        <legend>{group.section}</legend>
                        <div className="cms-fields">
                          {group.fields.map(([key, label]) => (
                            <label className={['heroDescription', 'aboutParagraphOne', 'aboutParagraphTwo', 'whyDescription', 'academicDescription', 'academyDescription', 'facilitiesDescription', 'activitiesDescription', 'galleryDescription', 'leadershipDescription', 'leadershipBody', 'admissionsDescription', 'contactDescription', 'footerDescription', 'mapEmbedUrl', 'directionsUrl'].includes(key) ? 'cms-field-wide' : ''} key={key}>
                              {label}
                              {['heroDescription', 'aboutParagraphOne', 'aboutParagraphTwo', 'whyDescription', 'academicDescription', 'academyDescription', 'facilitiesDescription', 'activitiesDescription', 'galleryDescription', 'leadershipDescription', 'leadershipBody', 'admissionsDescription', 'contactDescription', 'footerDescription'].includes(key)
                                ? <textarea rows="3" value={contentDraft[key] || ''} onChange={(event) => updateContentField(key, event.target.value)} />
                                : <input value={contentDraft[key] || ''} onChange={(event) => updateContentField(key, event.target.value)} />}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                    {CONTENT_LISTS.filter((list) => activePage.lists.includes(list.key)).map((list) => (
                      <fieldset className="cms-fieldset" key={list.key}>
                        <legend>{list.title}</legend>
                        {(contentDraft[list.key] || []).map((item, index) => (
                          <div className="cms-list-item" key={`${list.key}-${index}`}>
                            <div className="cms-fields">
                              {list.fields.map(([field, label]) => (
                                <label className={field === 'description' || field === 'url' ? 'cms-field-wide' : ''} key={field}>
                                  {label}
                                  {field === 'imageKey' && list.key === 'activities'
                                    ? <select value={item?.[field] || 'activityOne'} onChange={(event) => updateContentListItem(list.key, index, field, event.target.value)}>{CONTENT_IMAGES.filter(([imageKey]) => imageKey.startsWith('activity')).map(([imageKey, imageLabel]) => <option key={imageKey} value={imageKey}>{imageLabel}</option>)}</select>
                                    : field === 'imageKey'
                                    ? <input value={item?.[field] || ''} readOnly />
                                    : field === 'description'
                                    ? <textarea rows="2" value={field === 'value' ? item : item?.[field] || ''} onChange={(event) => updateContentListItem(list.key, index, field, event.target.value)} />
                                    : <input value={field === 'value' ? item : item?.[field] || ''} onChange={(event) => updateContentListItem(list.key, index, field, event.target.value)} />}
                                </label>
                              ))}
                            </div>
                            {(list.key === 'schoolFaculty' || list.key === 'academyFaculty') && (
                              <label className="faculty-photo-upload">
                                Faculty photo
                                <Image
                                  src={contentDraft.images?.[item.imageKey] || settings.content?.images?.[item.imageKey] || '/images/welcome-student.webp'}
                                  alt={`${item.name || 'Faculty member'} photo`}
                                  width={90}
                                  height={110}
                                  unoptimized
                                />
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(event) => uploadContentImage(event, item.imageKey)}
                                  disabled={busyAction === `content-image-${item.imageKey}`}
                                />
                              </label>
                            )}
                            <button className="button button-outline button-small" type="button" onClick={() => removeContentListItem(list.key, index)}>Remove</button>
                          </div>
                        ))}
                        <button className="button button-outline button-small" type="button" onClick={() => addContentListItem(list)}>＋ Add item</button>
                      </fieldset>
                    ))}
                    {activePage.id === 'gallery' && <fieldset className="cms-fieldset">
                      <legend>Gallery display</legend>
                      <div className="cms-fields">
                        <label>Display layout<select value={contentDraft.galleryLayout || 'grid'} onChange={(event) => updateContentField('galleryLayout', event.target.value)}><option value="grid">Grid</option><option value="slider">Horizontal slider</option></select></label>
                        <label>Grid columns<select value={contentDraft.galleryColumns || 3} onChange={(event) => updateContentField('galleryColumns', Number(event.target.value))}><option value="2">2 columns</option><option value="3">3 columns</option><option value="4">4 columns</option></select></label>
                      </div>
                    </fieldset>}
                    <button className="button" type="submit" disabled={busyAction === 'content'}>{busyAction === 'content' ? 'Saving…' : `Save ${activePage.label}`}</button>
                    </form>
                  </section>
                )}

                {activePage?.id === 'images' && (
                  <section className="admin-panel">
                  <div className="cms-image-manager">
                    <h3>Homepage section images</h3>
                    <p className="admin-help">Preset images are stored in Cloudinary. Upload a replacement for any slot to update that image across the website.</p>
                    <div className="cms-image-grid">
                      {CONTENT_IMAGES.map(([slot, label]) => (
                        <label className="cms-image-field" key={slot}>
                          <span>{label}</span>
                          <Image src={contentDraft.images?.[slot] || settings.content?.images?.[slot] || '/images/hira-school-logo.png'} alt={label} width={260} height={150} unoptimized />
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadContentImage(event, slot)} disabled={busyAction === `content-image-${slot}`} />
                          {busyAction === `content-image-${slot}` && <small>Uploading…</small>}
                        </label>
                      ))}
                    </div>
                  </div>
                  </section>
                )}

                {activePage?.id === 'location' && <section className="admin-panel">
                  <div className="admin-panel-heading"><div><p className="eyebrow">HOMEPAGE</p><h2>Campus location</h2></div><span className="admin-count">LIVE</span></div>
                  <p className="admin-help">This address appears on the school website and in the contact section.</p>
                  <form className="admin-inline-form" onSubmit={saveLocation}>
                    <label className="admin-grow">Location<input value={locationInput} onChange={(event) => setLocationInput(event.target.value)} maxLength={300} required /></label>
                    <button className="button" type="submit" disabled={busyAction === 'location'}>{busyAction === 'location' ? 'Saving…' : 'Save location'}</button>
                  </form>
                </section>}

                {activePage?.id === 'gallery-admin' && <section className="admin-panel">
                  <div className="admin-panel-heading"><div><p className="eyebrow">HOMEPAGE</p><h2>Photo gallery</h2></div><span className="admin-count">{settings.gallery.length} / 6 IMAGES</span></div>
                  <p className="admin-help">Add JPG, PNG, or WebP campus photos. The website allows up to six images.</p>
                  <form className="admin-inline-form gallery-upload-form" onSubmit={uploadGallery}>
                    <label>Photo category<select value={selectedGalleryCategory} onChange={(event) => setGalleryCategory(event.target.value)} required>{galleryCategories.map((filter) => <option key={filter}>{filter}</option>)}</select></label>
                    <label className="admin-grow">Choose images<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))} /></label>
                    <button className="button" type="submit" disabled={busyAction === 'gallery' || settings.gallery.length >= 6}>{busyAction === 'gallery' ? 'Uploading…' : 'Upload photos'}</button>
                  </form>
                  {galleryFiles.length > 0 && <p className="admin-help">{galleryFiles.length} selected · {Math.max(0, 6 - settings.gallery.length)} remaining slots</p>}
                  {settings.gallery.length > 0 ? (
                    <div className="admin-gallery-grid">
                      {settings.gallery.map((image, index) => (
                        <article className="admin-gallery-item" key={image.id || image.url}>
                          <Image src={image.url} alt={image.alt || `Campus image ${index + 1}`} width={340} height={220} unoptimized />
                          <div><span>{image.alt || `Campus image ${index + 1}`}</span><button type="button" onClick={() => removeGalleryImage(image.id)} disabled={busyAction === `image-${image.id}`}>Remove</button></div>
                        </article>
                      ))}
                    </div>
                  ) : <p className="admin-empty">No gallery images yet.</p>}
                </section>}

                {activePage?.id === 'results' && <section className="admin-panel">
                  <div className="admin-panel-heading"><div><p className="eyebrow">CONTENT</p><h2>Class results</h2></div><span className="admin-count">{results.length} PUBLISHED</span></div>
                  <p className="admin-help">Upload a PDF for a class and section. A new upload replaces the existing sheet for that combination.</p>
                  <form className="admin-result-form" onSubmit={uploadResult}>
                    <label>Class<select value={resultSelection.className} onChange={(event) => setResultSelection((current) => ({ ...current, className: event.target.value }))}>{CLASSES.map((className) => <option key={className}>{className}</option>)}</select></label>
                    <label>Section<select value={resultSelection.section} onChange={(event) => setResultSelection((current) => ({ ...current, section: event.target.value }))}>{SECTIONS.map((section) => <option key={section}>{section}</option>)}</select></label>
                    <label className="result-file-input">Result PDF<input type="file" accept="application/pdf,.pdf" onChange={(event) => setResultFile(event.target.files?.[0] || null)} required /></label>
                    <button className="button" type="submit" disabled={busyAction === 'result'}>{busyAction === 'result' ? 'Publishing…' : '＋ Add result'}</button>
                  </form>
                  {results.length ? (
                    <div className="admin-result-list">
                      {results.map((result) => (
                        <article className="admin-result-row" key={`${result.className}-${result.section}`}>
                          <span className="result-row-icon" aria-hidden="true">▤</span>
                          <div className="result-row-info"><strong>{result.className} result</strong><span>{result.className} · Section {result.section}</span></div>
                          <span className="published-pill">Published</span>
                          <a href={result.url} target="_blank" rel="noreferrer">Open PDF ↗</a>
                          <button
                            className="button button-outline button-small result-remove-button"
                            type="button"
                            onClick={() => removeResult(result)}
                            disabled={busyAction === `result-${result.className}-${result.section}`}
                          >
                            {busyAction === `result-${result.className}-${result.section}` ? 'Removing…' : 'Remove PDF'}
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : <p className="admin-empty">No result sheets have been published yet.</p>}
                </section>}
                {!isDashboard && <p className="admin-footnote">Website content and images are saved through the backend. Admission forms stay in the visitor&apos;s browser and are never uploaded.</p>}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
