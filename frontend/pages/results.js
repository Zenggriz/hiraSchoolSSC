// Parent class aur section select karta hai; backend us combination ki latest PDF deta hai.
import Head from 'next/head';
import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '../lib/api';

const CLASSES = [
  'Playgroup',
  'Nursery',
  'KG',
  ...Array.from({ length: 10 }, (_, index) => `Class ${index + 1}`),
];
const SECTIONS = ['A', 'B', 'C', 'D'];

export default function Results() {
  const [selection, setSelection] = useState({ className: 'Playgroup', section: 'A' });
  const [status, setStatus] = useState({ text: '', error: false });
  const [loading, setLoading] = useState(false);

  async function searchResults(event) {
    event.preventDefault();
    setStatus({ text: '', error: false });
    const resultTab = window.open('about:blank', '_blank');
    if (resultTab) resultTab.opener = null;
    setLoading(true);

    try {
      const { data } = await axios.get(`${API_URL}/api/results`, {
        params: { class: selection.className, section: selection.section },
      });
      if (!data.url) throw new Error('The selected result sheet is not available yet.');
      if (resultTab) resultTab.location.replace(data.url);
      else {
        const link = document.createElement('a');
        link.href = data.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }
      setStatus({ text: `${data.className}, Section ${data.section} result opened in a new tab.`, error: false });
    } catch (error) {
      resultTab?.close();
      setStatus({
        text: error.response?.data?.message || error.message || 'Could not load the result sheet.',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Student Results | Hira School — Shamim Saeed Campus</title></Head>
      <main id="main-content">
        <section className="section academics inner-page">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Student Results</span>
              <h1 className="section-title">Section-wise Result Sheets</h1>
              <p className="section-copy">Choose a class and section to open the latest result sheet published by the school.</p>
              <div className="divider" />
            </div>
            <form className="form-box results-panel" onSubmit={searchResults}>
              <h2>Search &amp; Download</h2>
              <div className="result-controls">
                <div className="field">
                  <label htmlFor="resultClass">Class</label>
                  <select id="resultClass" value={selection.className} onChange={(event) => setSelection((current) => ({ ...current, className: event.target.value }))}>
                    {CLASSES.map((className) => <option key={className}>{className}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="resultSection">Section</label>
                  <select id="resultSection" value={selection.section} onChange={(event) => setSelection((current) => ({ ...current, section: event.target.value }))}>
                    {SECTIONS.map((section) => <option key={section}>{section}</option>)}
                  </select>
                </div>
                <button className="btn submit" disabled={loading} type="submit"><i className="fa-solid fa-magnifying-glass" />{loading ? 'Searching…' : 'Search & Download'}</button>
              </div>
              <p aria-live="polite" className={`page-status${status.error ? ' error' : ''}`}>{status.text || 'Published result sheets open as PDFs in a new tab.'}</p>
            </form>
            <div className="page-links"><Link href="/">Back to home</Link><Link href="/admission">Admission form</Link></div>
          </div>
        </section>
      </main>
    </>
  );
}
