// Admission data aur student photo sirf browser mein rehte hain; PDF download ke ilawa server ko nahi bheje jate.
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useState } from 'react';
import { useSiteSettings } from '../components/SiteLayout';
import { API_URL } from '../lib/api';

const CLASSES = ['Playgroup', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const EMPTY_FORM = {
  studentName: '',
  fatherName: '',
  dob: '',
  gender: '',
  classAppliedFor: '',
  contactNumber: '',
  email: '',
  message: '',
  address: '',
  photo: '',
  photoType: '',
};
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

async function getSchoolLogoDataUrl(logoUrl) {
  if (!logoUrl) throw new Error('The school logo is not ready yet.');
  const { data: logo } = await axios.get(logoUrl, { responseType: 'blob' });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The school logo could not be read.'));
    reader.readAsDataURL(logo);
  });
}

export default function Admission() {
  const settings = useSiteSettings();
  const logoUrl = settings.content?.images?.logo || '';
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function readStudentPhoto(event) {
    const file = event.target.files?.[0];
    setStatus({ text: '', error: false });

    if (!file) {
      setForm((current) => ({ ...current, photo: '', photoType: '' }));
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      event.target.value = '';
      setStatus({ text: 'Please choose a JPG or PNG photo.', error: true });
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      event.target.value = '';
      setStatus({ text: 'The photo must be 5 MB or smaller.', error: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((current) => ({ ...current, photo: reader.result, photoType: file.type }));
      }
    };
    reader.onerror = () => {
      setStatus({ text: 'The photo could not be read. Please try another file.', error: true });
    };
    reader.readAsDataURL(file);
  }

  async function downloadAdmissionForm(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus({ text: '', error: false });
    setSubmitting(true);

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
      const schoolLogo = await getSchoolLogoDataUrl(logoUrl);
      pdf.addImage(schoolLogo, 'PNG', 18, 15, 72, 21);
      pdf.setTextColor(24, 36, 92);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('STUDENT ADMISSION FORM', 105, 43, { align: 'center' });
      if (form.photo) {
        pdf.addImage(form.photo, form.photoType === 'image/png' ? 'PNG' : 'JPEG', 165, 16, 27, 35, undefined, 'FAST');
      }
      pdf.setDrawColor(201, 162, 39);
      pdf.setLineWidth(0.8);
      pdf.line(18, 55, 192, 55);

      const admissionDetails = [
        ['Student name', form.studentName],
        ["Father's name", form.fatherName],
        ['Date of birth', form.dob],
        ['Gender', form.gender],
        ['Class applied for', form.classAppliedFor],
        ['WhatsApp / contact number', form.contactNumber],
        ...(form.email.trim() ? [['Email', form.email.trim()]] : []),
        ...(form.message.trim() ? [['Message', form.message.trim()]] : []),
        ['Residential address', form.address],
      ];
      autoTable(pdf, {
        startY: 63,
        theme: 'grid',
        head: [['Student information', 'Details']],
        body: admissionDetails,
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: [24, 36, 92], textColor: [255, 255, 255] },
        columnStyles: { 0: { cellWidth: 62 }, 1: { cellWidth: 112 } },
        margin: { left: 18, right: 18 },
      });

      let signatureY = pdf.lastAutoTable.finalY + 28;
      if (signatureY > 267) {
        pdf.addPage();
        signatureY = 35;
      }
      pdf.setFontSize(9);
      pdf.text('Parent / guardian signature', 22, signatureY);
      pdf.text('Office use only', 137, signatureY);
      pdf.setDrawColor(140, 148, 160);
      pdf.line(22, signatureY + 17, 83, signatureY + 17);
      pdf.line(137, signatureY + 17, 189, signatureY + 17);

      const safeName = form.studentName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
      pdf.save(`hira-school-admission-${safeName || 'form'}.pdf`);
      try {
        const { data } = await axios.post(`${API_URL}/api/admission-notification`, {
          name: form.studentName,
          fatherName: form.fatherName,
          phone: form.contactNumber,
          email: form.email.trim(),
          message: form.message.trim(),
        });
        setForm(EMPTY_FORM);
        formElement.reset();
        setStatus({ text: `Your PDF is downloaded. ${data.message} Print the form and submit it to the school office.`, error: false });
      } catch (error) {
        setStatus({
          text: `Your PDF has downloaded, but the school could not be notified: ${error.response?.data?.message || 'Please check your connection and submit again.'}`,
          error: true,
        });
      }
    } catch {
      setStatus({ text: 'The PDF could not be created. Please try again.', error: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Student Admission | Hira School — Shamim Saeed Campus</title><meta name="robots" content="noindex,follow" /></Head>
      <main id="main-content">
        <section className="admissions inner-page">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow gold">{settings.content?.admissionBanner || 'Admissions Open'}</span>
              <div className="admission-brand">
                {logoUrl && <Image src={logoUrl} alt="Hira School Shamim Saeed Campus logo" width={1813} height={518} priority unoptimized />}
              </div>
              <p className="section-copy">Complete the form below, download the PDF, then print and bring it to the school office.</p>
              <div className="divider" />
            </div>

            <form className="form-box" onSubmit={downloadAdmissionForm}>
              <h2>Student Admission Form</h2>
              <div className="admission-form-grid">
                <div className="form-grid">
                  <div className="field"><label htmlFor="studentName">Student Name *</label><input id="studentName" name="studentName" autoComplete="name" value={form.studentName} onChange={updateField} required maxLength={100} /></div>
                  <div className="field"><label htmlFor="fatherName">Father&apos;s Name *</label><input id="fatherName" name="fatherName" value={form.fatherName} onChange={updateField} required maxLength={100} /></div>
                  <div className="field"><label htmlFor="dob">Date of Birth *</label><input id="dob" name="dob" type="date" max={new Date().toISOString().slice(0, 10)} value={form.dob} onChange={updateField} required /></div>
                  <div className="field"><label htmlFor="gender">Gender *</label><select id="gender" name="gender" value={form.gender} onChange={updateField} required><option value="">Select gender</option><option>Female</option><option>Male</option></select></div>
                  <div className="field"><label htmlFor="classAppliedFor">Class Applied For *</label><select id="classAppliedFor" name="classAppliedFor" value={form.classAppliedFor} onChange={updateField} required><option value="">Select class</option>{CLASSES.map((className) => <option key={className}>{className}</option>)}</select></div>
                  <div className="field"><label htmlFor="contactNumber">WhatsApp / Contact Number *</label><input id="contactNumber" name="contactNumber" type="tel" inputMode="tel" autoComplete="tel" value={form.contactNumber} onChange={updateField} required maxLength={30} /></div>
                  <div className="field"><label htmlFor="email">Email (optional)</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} maxLength={254} /></div>
                  <div className="field full"><label htmlFor="message">Message (optional)</label><textarea id="message" name="message" rows="2" value={form.message} onChange={updateField} maxLength={2000} /></div>
                  <div className="field full"><label htmlFor="address">Residential Address *</label><textarea id="address" name="address" autoComplete="street-address" rows="3" value={form.address} onChange={updateField} required maxLength={500} /></div>
                </div>
                <div className="field photo-field">
                  <label htmlFor="studentPhoto">Student Face / Passport Photo</label>
                  <div className="student-photo-box">
                    {form.photo
                      ? <Image src={form.photo} alt="Student photo preview" width={320} height={380} unoptimized />
                      : <span className="student-photo-placeholder">Photo preview appears here</span>}
                  </div>
                  <input id="studentPhoto" name="studentPhoto" type="file" accept="image/jpeg,image/png" onChange={readStudentPhoto} />
                  <p className="privacy-note">JPG or PNG · Maximum 5 MB</p>
                </div>
              </div>
              <p className="privacy-note">The PDF and student photo are handled in this browser. Name, father&apos;s name, phone, and any optional email/message are sent to school management by WhatsApp only; application details are not saved in the website database.</p>
              <button className="btn submit" type="submit" disabled={submitting}><i className="fa-solid fa-file-pdf" />{submitting ? 'Preparing your form…' : 'Download &amp; Print Admission PDF'}</button>
              <p aria-live="polite" className={`form-status${status.error ? ' error' : status.text ? ' success' : ''}`}>{status.text}</p>
            </form>
            <div className="page-links"><Link href="/">Back to home</Link><Link href="/results">View student results</Link></div>
          </div>
        </section>
      </main>
    </>
  );
}
