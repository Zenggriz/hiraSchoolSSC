// Homepage ki tamam copy aur images backend ke live CMS settings se render hoti hain.
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useState } from 'react';
import { useSiteSettings } from '../components/SiteLayout';
import { API_URL } from '../lib/api';

function SectionHeading({ eyebrow, title, description, gold = false }) {
  return (
    <div className="section-head">
      <span className={`eyebrow${gold ? ' gold' : ''}`}>{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-copy">{description}</p>}
      <div className="divider" />
    </div>
  );
}

export default function Home() {
  const settings = useSiteSettings();
  const copy = settings.content;
  const [activeFilter, setActiveFilter] = useState('');
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useState({ text: '', type: '' });
  const [sendingInquiry, setSendingInquiry] = useState(false);

  if (!settings.loaded || settings.error) {
    const message = settings.loaded
      ? settings.content.configUnavailableMessage || settings.error
      : settings.content.heroLoadingMessage || 'Loading website…';
    return <main id="main-content" className="inner-page"><div className="container"><p role="status">{message}</p></div></main>;
  }

  const selectedFilter = activeFilter || copy.galleryFilters[0];
  const gallery = settings.galleryManaged
    ? settings.gallery.map((image) => ({
      url: image.url,
      alt: image.alt,
      caption: image.alt,
      category: image.category,
    }))
    : copy.galleryItems;
  const filteredGallery = selectedFilter === copy.galleryFilters[0]
    ? gallery
    : gallery.filter((image) => (image.category || '').toLowerCase() === activeFilter.toLowerCase());

  function updateInquiry(event) {
    setInquiry((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitInquiry(event) {
    event.preventDefault();
    setSendingInquiry(true);
    setInquiryStatus({ text: '', type: '' });

    try {
      const { data } = await axios.post(`${API_URL}/api/contact-us`, {
        ...inquiry,
        brandName: copy.siteName,
      });
      setInquiryStatus({ text: data.message, type: 'success' });
      setInquiry({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setInquiryStatus({
        text: error.response?.data?.message || copy.inquiryFallbackError,
        type: 'error',
      });
    } finally {
      setSendingInquiry(false);
    }
  }

  return (
    <>
      <Head><title>{copy.siteName}</title></Head>
      <main id="main-content">
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div>
              <span className="hero-badge"><i className="fa-solid fa-star" />{copy.admissionBanner}</span>
              <h1>{copy.heroLineOne}<br /><span>{copy.heroLineTwo}</span><br />{copy.heroLineThree}</h1>
              <p>{copy.heroDescription}</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/admission"><i className="fa-solid fa-file-signature" />{copy.heroApplyLabel}</Link>
                <a className="btn btn-wa" href={`https://wa.me/${copy.whatsappInternational}`} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp" />{copy.heroWhatsAppLabel}</a>
              </div>
              <div className="hero-trust">
                {copy.trustItems.map((item) => <div className="trust-item" key={item.title}><strong>{item.title}</strong><span>{item.description}</span></div>)}
              </div>
            </div>
            <div className="hero-photo">
              <Image src={copy.images.hero} alt={copy.heroImageAlt} width={960} height={960} priority unoptimized={copy.images.hero.startsWith('http')} />
            </div>
          </div>
        </section>

        <div className="motto">
          <div className="container motto-inner"><strong>{copy.motto}</strong><span>{copy.mottoDescription}</span></div>
        </div>

        <section className="section" id="about">
          <div className="container about-grid">
            <div className="about-photo">
              <Image src={copy.images.about} alt={copy.aboutImageAlt} width={1400} height={1050} unoptimized={copy.images.about.startsWith('http')} />
              <div className="badge"><strong>{copy.aboutBadgeTitle}</strong><span>{copy.aboutBadgeSubtitle}</span></div>
            </div>
            <div className="about-copy">
              <span className="eyebrow">{copy.aboutEyebrow}</span>
              <h2 className="section-title">{copy.aboutTitle}</h2>
              <div className="divider" />
              <p>{copy.aboutParagraphOne}</p>
              <p>{copy.aboutParagraphTwo}</p>
              <ul className="check-list">
                {copy.aboutHighlights.map((highlight) => <li key={highlight}><i className="fa-solid fa-circle-check" />{highlight}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="section why" id="why-us">
          <div className="container">
            <SectionHeading eyebrow={copy.whyEyebrow} title={copy.whyTitle} description={copy.whyDescription} />
            <div className="why-grid">
              {copy.benefits.map((item) => <article className="info-card" key={item.title}><div className="icon-box"><i className={`fa-solid ${item.icon}`} /></div><h3>{item.title}</h3><p>{item.description}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section academics" id="academics">
          <div className="container">
            <SectionHeading eyebrow={copy.academicEyebrow} title={copy.academicTitle} description={copy.academicDescription} />
            <div className="academic-grid">
              {copy.academicStages.map((stage) => <article className="academic-card" key={stage.title}><div className="academic-icon"><i className={`fa-solid ${stage.icon}`} /></div><h3>{stage.title}</h3><p><strong>{stage.classes}</strong><br />{stage.description}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section facilities" id="facilities">
          <div className="container">
            <SectionHeading eyebrow={copy.facilitiesEyebrow} title={copy.facilitiesTitle} description={copy.facilitiesDescription} gold />
            <div className="facility-grid">
              {copy.facilities.map((item) => <article className="facility-card" key={item.title}><div className="icon-box"><i className={`fa-solid ${item.icon}`} /></div><h3>{item.title}</h3><p>{item.description}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section activities" id="activities">
          <div className="container">
            <SectionHeading eyebrow={copy.activitiesEyebrow} title={copy.activitiesTitle} description={copy.activitiesDescription} />
            <div className="activity-grid">
              {copy.activities.map((activity) => (
                <div className="activity" key={activity.imageKey}>
                  <Image src={copy.images[activity.imageKey]} alt={activity.imageAlt || activity.title} width={960} height={960} unoptimized={copy.images[activity.imageKey].startsWith('http')} />
                  <span className="activity-label">{activity.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section gallery" id="gallery">
          <div className="container">
            <SectionHeading eyebrow={copy.galleryEyebrow} title={copy.galleryTitle} description={copy.galleryDescription} />
            <div className="gallery-tabs">
              {copy.galleryFilters.map((filter) => (
                <button className={selectedFilter === filter ? 'active' : ''} key={filter} onClick={() => setActiveFilter(filter)} type="button">{filter}</button>
              ))}
            </div>
            <div
              className={`gallery-grid${settings.galleryLayout.mode === 'slider' ? ' gallery-slider' : ''}`}
              style={{ '--gallery-columns': settings.galleryLayout.columns }}
            >
              {filteredGallery.map((image, index) => (
                <div className="gallery-item" key={image.id || image.url}>
                  <Image src={image.url} alt={image.alt} width={960} height={720} unoptimized={image.url.startsWith('http')} />
                  <span className="gallery-caption">{image.caption || image.alt}</span>
                </div>
              ))}
              {filteredGallery.length === 0 && <p className="page-status">{copy.galleryEmptyMessage}</p>}
            </div>
          </div>
        </section>

        <section className="section leadership" id="leadership">
          <div className="container">
            <SectionHeading eyebrow={copy.leadershipEyebrow} title={copy.leadershipTitle} description={copy.leadershipDescription} />
            <div className="leadership-card">
              <div className="leadership-photo"><Image src={copy.images.leadership} alt={copy.leadershipImageAlt} width={640} height={1136} unoptimized={copy.images.leadership.startsWith('http')} /></div>
              <div className="leadership-copy">
                <span className="eyebrow gold">{copy.leadershipLabel}</span>
                <h3>{copy.leadershipStatement}</h3>
                <p>{copy.leadershipBody}</p>
                <div className="leadership-points">
                  {copy.leadershipPoints.map((point) => <div key={point}><i className="fa-solid fa-circle-check" /><span>{point}</span></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admissions" id="admissions">
          <div className="container admission-grid">
            <div>
              <span className="eyebrow gold">{copy.admissionBanner}</span>
              <h2 className="section-title">{copy.admissionsTitle}</h2>
              <p className="section-copy">{copy.admissionsDescription}</p>
              <div className="contact-bullets">
                <a className="contact-bullet" href={`https://wa.me/${copy.whatsappInternational}`} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp" /><span><strong>{copy.inquiryWhatsAppTitle}</strong><span>{copy.whatsapp}</span></span></a>
                <a className="contact-bullet" href={`tel:${copy.phoneOneLink}`}><i className="fa-solid fa-phone" /><span><strong>{copy.admissionsOfficeLabel}</strong><span>{copy.phoneOne}</span></span></a>
                <a className="contact-bullet" href={`tel:${copy.phoneTwoLink}`}><i className="fa-solid fa-phone" /><span><strong>{copy.campusAdminLabel}</strong><span>{copy.phoneTwo}</span></span></a>
                <a className="contact-bullet" href={`mailto:${copy.email}`}><i className="fa-solid fa-envelope" /><span><strong>{copy.officialEmailLabel}</strong><span>{copy.email}</span></span></a>
              </div>
            </div>
            <div className="form-box">
              <h3>{copy.inquiryTitle}</h3>
              <form onSubmit={submitInquiry}>
                <div className="form-grid">
                  <div className="field"><label htmlFor="parentName">{copy.inquiryNameLabel}</label><input id="parentName" name="name" placeholder={copy.inquiryPlaceholderName} value={inquiry.name} onChange={updateInquiry} required minLength={2} maxLength={100} /></div>
                  <div className="field"><label htmlFor="inquiryEmail">{copy.inquiryEmailLabel}</label><input id="inquiryEmail" name="email" type="email" placeholder={copy.inquiryPlaceholderEmail} value={inquiry.email} onChange={updateInquiry} required maxLength={254} /></div>
                  <div className="field"><label htmlFor="inquiryPhone">{copy.inquiryPhoneLabel}</label><input id="inquiryPhone" name="phone" inputMode="tel" placeholder={copy.inquiryPlaceholderPhone} value={inquiry.phone} onChange={updateInquiry} maxLength={30} /></div>
                  <div className="field"><label htmlFor="inquiryMessage">{copy.inquiryMessageLabel}</label><textarea id="inquiryMessage" name="message" placeholder={copy.inquiryPlaceholderMessage} value={inquiry.message} onChange={updateInquiry} required minLength={5} maxLength={2000} rows="1" /></div>
                </div>
                <button className="btn submit" disabled={sendingInquiry} type="submit"><i className="fa-brands fa-whatsapp" />{sendingInquiry ? copy.inquirySendingLabel : copy.inquirySubmitLabel}</button>
                <p aria-live="polite" className={`form-status ${inquiryStatus.type}`}>{inquiryStatus.text}</p>
              </form>
              <p className="form-status">{copy.inquiryAdmissionPrefix} <Link href="/admission">{copy.inquiryAdmissionAction}</Link></p>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <SectionHeading eyebrow={copy.contactEyebrow} title={copy.contactTitle} description={copy.contactDescription} />
            <div className="contact-grid">
              <div className="contact-list">
                <div className="contact-item"><i className="fa-solid fa-map-location-dot" /><div><h3>{copy.contactAddressLabel}</h3><p>{settings.liveLocation}</p></div></div>
                <div className="contact-item"><i className="fa-brands fa-whatsapp" /><div><h3>{copy.contactWhatsAppLabel}</h3><a href={`https://wa.me/${copy.whatsappInternational}`} target="_blank" rel="noopener noreferrer">{copy.whatsapp}</a></div></div>
                <div className="contact-item"><i className="fa-solid fa-phone" /><div><h3>{copy.contactPhoneLabel}</h3><p><a href={`tel:${copy.phoneOneLink}`}>{copy.phoneOne}</a> / <a href={`tel:${copy.phoneTwoLink}`}>{copy.phoneTwo}</a></p></div></div>
                <div className="contact-item"><i className="fa-solid fa-envelope" /><div><h3>{copy.contactEmailLabel}</h3><a href={`mailto:${copy.email}`}>{copy.email}</a></div></div>
              </div>
              <div className="map-wrap">
                <iframe
                  allowFullScreen
                  loading="lazy"
                  src={copy.mapEmbedUrl}
                  title={copy.mapTitle}
                />
                <a className="map-btn" href={copy.directionsUrl} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-diamond-turn-right" />&nbsp; {copy.directionsLabel}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <h2>{copy.finalTitle}</h2>
            <p>{copy.finalDescription}</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn-primary" href="/admission">{copy.applyNowLabel}</Link>
              <a className="btn btn-outline" href={`https://wa.me/${copy.whatsappInternational}`} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp" />{copy.finalWhatsAppLabel}</a>
            </div>
            <Link className="results-cta-link" href="/results">{copy.resultsLinkLabel}</Link>
          </div>
        </section>
      </main>
    </>
  );
}
