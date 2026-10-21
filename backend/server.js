require('dotenv').config();

// API routes yahan aik hi file mein hain; database, models aur Cloudinary config alag modules se aate hain.
const crypto = require('node:crypto');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const {
  cloudinary,
  deleteCloudinaryAsset,
  hasCloudinary,
  isCloudinaryImageUrl,
  uploadPresetImage,
  uploadToCloudinary,
} = require('./cloudinary');
const { connectDatabase, isDatabaseConnected } = require('./db');
const WebsiteSettings = require('./models/WebsiteSettings');
const ResultSheet = require('./models/ResultSheet');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MAX_GALLERY_IMAGES = 6;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const CLASSES = new Set([
  'Playgroup',
  'Nursery',
  'KG',
  ...Array.from({ length: 10 }, (_, index) => `Class ${index + 1}`),
]);
const SECTIONS = new Set(['A', 'B', 'C', 'D']);
const DEFAULT_STUDENT_ACHIEVEMENT_IMAGE = '/images/student-achievement-new.webp';
const DEFAULT_SETTINGS = {
  liveLocation: 'Bungalow No: 29, Sector 3, Sukkur Township',
  gallery: [],
  content: {},
};
const DEFAULT_CONTENT = {
  heroBadge: 'Admissions Open — Session 2026–2027',
  heroLineOne: 'Nurturing Minds.',
  heroLineTwo: 'Building Character.',
  heroLineThree: 'Inspiring Leaders.',
  heroDescription: 'Premier English-medium education seamlessly integrated with Islamic Tarbiyah in Sukkur Township, preparing students from Playgroup to Matric for academic and moral leadership.',
  heroImageAlt: 'Hira School Shamim Saeed Campus exterior in Sukkur Township',
  heroApplyLabel: 'Apply for Admission',
  heroWhatsAppLabel: 'WhatsApp Us',
  heroLoadingMessage: 'Loading the latest school website content…',
  configUnavailableMessage: 'Website content is temporarily unavailable. Please try again later.',
  motto: 'COME & READ — GO & LEAD',
  mottoDescription: "Quality Education — Our Commitment | Bright Future — Your Child's Future",
  trustItems: [
    { title: 'Playgroup–Matric', description: 'Academic Journey' },
    { title: 'English Medium', description: 'Modern Education' },
    { title: 'Islamic Tarbiyah', description: 'Character Building' },
  ],
  aboutEyebrow: 'Welcome to Hira School',
  aboutTitle: 'A Legacy of Academic Excellence & Moral Tarbiyah',
  aboutParagraphOne: 'At Hira School — Shamim Saeed Campus (Sukkur Township), we believe that real education extends beyond textbooks. Our institution offers modern scientific education harmoniously blended with Islamic character building.',
  aboutParagraphTwo: 'We provide a disciplined, safe, and nurturing environment with modern facilities, ensuring that every student develops academically while growing in confidence, character, and leadership.',
  aboutImageAlt: 'Young student at Hira School',
  aboutBadgeTitle: 'HIRA SCHOOL',
  aboutBadgeSubtitle: 'Shamim Saeed Campus',
  aboutHighlights: [
    'Integrated Modern & Islamic Curriculum',
    'Highly Qualified & Dedicated Teaching Faculty',
    'Focus on Character Building, Hifz & Public Speaking',
  ],
  academyEyebrow: 'Evening Academy',
  academyTitle: 'Focused Learning After School',
  academyDescription: 'Hira School Shamim Saeed Campus also offers evening academy classes in a supportive, focused learning environment.',
  academySchedule: 'Evening classes · Contact the campus for current timings',
  academyHighlights: ['Experienced faculty', 'Small-group guidance', 'Focused subject support'],
  academyPrograms: [
    { title: 'Subject Coaching', description: 'Focused support to strengthen understanding and classroom performance.' },
    { title: 'Exam Preparation', description: 'Structured revision and practice to help students prepare with confidence.' },
  ],
  facultyEyebrow: 'Our Faculty',
  facultyTitle: 'Meet the People Who Guide Our Students',
  facultyDescription: 'Choose School or Academy to see the faculty supporting each learning program.',
  facultySchoolLabel: 'School',
  facultyAcademyLabel: 'Academy',
  schoolFaculty: [
    { name: 'School Faculty', designation: 'Teaching team', imageKey: 'schoolFaculty-1' },
  ],
  academyFaculty: [
    { name: 'Academy Faculty', designation: 'Evening teaching team', imageKey: 'academyFaculty-1' },
  ],
  whyEyebrow: 'Why Hira School',
  whyTitle: 'A Strong Foundation for Every Child',
  whyDescription: 'A disciplined and supportive environment designed around academics, character, safety, and student development.',
  benefits: [
    { icon: 'fa-user-shield', title: 'Professional Environment', description: 'Disciplined, peaceful, and structured atmosphere conducive to learning.' },
    { icon: 'fa-chalkboard-user', title: 'Qualified Teachers', description: 'Experienced and trained faculty dedicated to academic and character progress.' },
    { icon: 'fa-heart', title: 'Character Building', description: 'Education that gives importance to moral development and confidence.' },
    { icon: 'fa-people-roof', title: 'Parent Support', description: 'Friendly and supportive administration ready to assist parents.' },
  ],
  academicEyebrow: 'Academic Journey',
  academicTitle: 'Playgroup to Matric',
  academicDescription: 'Age-appropriate learning stages with academic foundations, practical skills, and Islamic Tarbiyah.',
  academicStages: [
    { icon: 'fa-shapes', title: 'Early Years', classes: 'Playgroup, Nursery & KG', description: 'Activity-based learning, motor skills, phonics, basic concepts, creative arts, and foundational Islamic Tarbiyah.' },
    { icon: 'fa-book-open', title: 'Primary', classes: 'Classes 1–5', description: 'English fluency, Mathematics, Science, Computer skills, and Islamic ethics with strong foundations.' },
    { icon: 'fa-flask', title: 'Middle', classes: 'Classes 6–8', description: 'Critical thinking, computer literacy, practical science, and analytical skill building.' },
    { icon: 'fa-award', title: 'Matric', classes: 'Classes 9–10', description: 'Board exam preparation, concept-based science, lab work, and individual career counseling.' },
  ],
  facilitiesEyebrow: 'Campus Facilities',
  facilitiesTitle: 'A Safe & Supportive Learning Environment',
  facilitiesDescription: 'Facilities and services highlighted by the campus for a clean, secure, and supportive learning experience.',
  facilities: [
    { icon: 'fa-school', title: 'Modern Classrooms', description: 'Well-ventilated, clean classrooms equipped with modern teaching tools.' },
    { icon: 'fa-video', title: 'CCTV Surveillance', description: 'Security camera monitoring across classrooms and campus grounds.' },
    { icon: 'fa-glass-water', title: 'Clean Water', description: 'Filtered, safe, and hygienic drinking water facilities for students.' },
    { icon: 'fa-chalkboard-user', title: 'Teaching Faculty', description: 'Dedicated teachers focused on academic and character development.' },
    { icon: 'fa-headset', title: 'Administration Support', description: 'Friendly and supportive administrative assistance for parents.' },
    { icon: 'fa-trophy', title: 'Sports & Activities', description: 'Sports days, Qiraat, Naat, speeches, science exhibitions, and annual events.' },
  ],
  activitiesEyebrow: 'Student Life',
  activitiesTitle: 'Learning Beyond the Classroom',
  activitiesDescription: 'Co-curricular learning helps students develop confidence, communication, creativity, and teamwork.',
  activities: [
    { title: 'Student Achievements', imageKey: 'activityOne' },
    { title: 'Kindergarten Learning', imageKey: 'activityTwo' },
    { title: 'Welcome to Hira School', imageKey: 'activityThree' },
    { title: 'Learning Environment', imageKey: 'activityFour' },
    { title: 'Hira School Campus', imageKey: 'activityFive' },
  ],
  galleryEyebrow: 'Campus Gallery',
  galleryTitle: 'Life at Hira School',
  galleryDescription: 'A glimpse into the Hira School campus, classrooms, student life, and achievements.',
  galleryFilters: ['All', 'Campus', 'Classrooms', 'Activities', 'Events'],
  galleryEmptyMessage: 'No photos in this category yet.',
  galleryItems: [
    { url: '/images/campus-exterior.webp', alt: 'Hira School campus', caption: 'Campus', category: 'Campus' },
    { url: '/images/welcome-student.webp', alt: 'Hira School student life', caption: 'Student Life', category: 'Activities' },
    { url: DEFAULT_STUDENT_ACHIEVEMENT_IMAGE, alt: 'Hira School students receiving achievement certificates', caption: 'Achievements', category: 'Events' },
    { url: '/images/kindergarten-learning.webp', alt: 'Hira School classroom activities', caption: 'Classroom Activities', category: 'Classrooms' },
    { url: '/images/learning-environment.webp', alt: 'Hira School learning environment', caption: 'Learning Environment', category: 'Classrooms' },
  ],
  galleryLayout: 'grid',
  galleryColumns: 3,
  leadershipEyebrow: 'School Leadership',
  leadershipTitle: 'The People Behind Hira School',
  leadershipDescription: 'School Owners & Management — guiding the campus with a focus on education, discipline, and student development.',
  leadershipLabel: 'School Owners & Management',
  leadershipStatement: "Committed to Every Student's Journey",
  leadershipBody: 'Hira School is built around a simple purpose: provide students with a strong academic foundation while developing confidence, discipline, and character.',
  leadershipImageAlt: 'Hira School owners and management with students at an achievement ceremony',
  leadershipPoints: ['Academic growth', 'Character & discipline', 'Student confidence'],
  admissionsEyebrow: 'Admissions Open 2026–2027',
  admissionsTitle: 'Join the Hira School Family',
  admissionsDescription: 'Admissions are open from Playgroup to Matric. Send an inquiry and connect directly with the school through WhatsApp.',
  inquiryTitle: 'Online Admission Inquiry',
  inquiryWhatsAppTitle: 'WhatsApp Inquiry',
  admissionsOfficeLabel: 'Admissions Office',
  campusAdminLabel: 'Campus Admin',
  officialEmailLabel: 'Official Email',
  inquiryNameLabel: 'Parent / Guardian Name *',
  inquiryEmailLabel: 'Email Address (optional)',
  inquiryPhoneLabel: 'WhatsApp / Phone Number *',
  inquiryMessageLabel: 'Your Message *',
  inquirySendingLabel: 'Sending inquiry…',
  inquirySubmitLabel: 'Send Inquiry to School Management',
  inquiryPlaceholderName: 'Enter full name',
  inquiryPlaceholderEmail: 'Enter your email',
  inquiryPlaceholderPhone: '03XXXXXXXXX',
  inquiryPlaceholderMessage: 'How can we help you?',
  inquiryAdmissionPrefix: 'Applying for a place?',
  inquiryAdmissionAction: 'Open the private admission form',
  inquiryFallbackError: 'Your inquiry could not be sent. Please try again.',
  contactEyebrow: 'Get in Touch',
  contactTitle: 'Visit Our Campus',
  contactDescription: 'Find the campus, contact the administration, or get directions through Google Maps.',
  contactAddressLabel: 'Campus Address',
  contactWhatsAppLabel: 'WhatsApp',
  contactPhoneLabel: 'Call Numbers',
  contactEmailLabel: 'Email',
  directionsLabel: 'Get Directions on Google Maps',
  finalTitle: "Ready to Begin Your Child's Journey?",
  finalDescription: 'Admissions are open for Session 2026–2027.',
  applyNowLabel: 'Apply Now',
  finalWhatsAppLabel: 'WhatsApp Us',
  resultsLinkLabel: 'Check section-wise results',
  siteName: 'Hira School Shamim Saeed Campus',
  footerDescription: 'Nurturing young minds with modern scientific education and Islamic moral character in Sukkur Township.',
  email: 'Saeedurrehman309@yahoo.com',
  whatsapp: '0318 1394588',
  whatsappInternational: '923181394588',
  phoneOne: '0300 0555547',
  phoneOneLink: '03000555547',
  phoneTwo: '0317 8532050',
  phoneTwoLink: '03178532050',
  admissionBanner: 'ADMISSIONS OPEN 2026–2027',
  skipLinkLabel: 'Skip to main content',
  primaryNavigationLabel: 'Primary navigation',
  mobileNavigationLabel: 'Mobile navigation',
  footerWhatsAppLabel: 'Chat on WhatsApp',
  navigationLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Academics', href: '#academics' },
    { label: 'Academy', href: '#academy' },
    { label: 'Faculty', href: '#faculty' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Activities', href: '#activities' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Results', href: '/results' },
    { label: 'Contact', href: '#contact' },
  ],
  navApplyLabel: 'Apply Now',
  footerQuickLinksTitle: 'Quick Links',
  footerAcademicsTitle: 'Academics',
  footerContactTitle: 'Contact Us',
  footerResultLink: 'Results',
  footerAcademicsLinks: [
    { label: 'Early Years', href: '/#academics' },
    { label: 'Primary — 1 to 5', href: '/#academics' },
    { label: 'Middle — 6 to 8', href: '/#academics' },
    { label: 'Matric — 9 to 10', href: '/#academics' },
    { label: 'Admissions', href: '/admission' },
  ],
  footerCopyright: '© 2026 Hira School — Shamim Saeed Campus. All Rights Reserved.',
  description: 'Hira School — Shamim Saeed Campus, Sukkur Township. English-medium education with Islamic Tarbiyah from Playgroup to Matric.',
  footerPrivacyLabel: 'Privacy Policy',
  footerTermsLabel: 'Terms',
  socialLinks: [
    { label: 'Facebook', icon: 'fa-facebook-f', url: 'https://www.facebook.com/share/1DhECVmaFf/' },
    { label: 'Instagram', icon: 'fa-instagram', url: 'https://www.instagram.com/hiraschool.shamimsaeed?igsh=d3g1MGVsMXlpajIz' },
    { label: 'TikTok', icon: 'fa-tiktok', url: 'https://www.tiktok.com/@hira.school.sukku?_r=1&_t=ZS-98jVK28lWLg' },
    { label: 'WhatsApp', icon: 'fa-whatsapp', url: 'https://wa.me/923181394588' },
  ],
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14132.890333271167!2d68.8500!3d27.7000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3935d326c51848a3%3A0x6b1076b15e44a4d9!2sSukkur%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s',
  mapTitle: 'Hira School location map',
  directionsUrl: 'https://maps.app.goo.gl/SKs2okWWHfCchhby9?g_st=ac',
  images: {
    hero: '/images/campus-exterior.webp',
    logo: '/images/hira-school-logo.png',
    about: '/images/welcome-student.webp',
    activityOne: DEFAULT_STUDENT_ACHIEVEMENT_IMAGE,
    activityTwo: '/images/kindergarten-learning.webp',
    activityThree: '/images/welcome-student.webp',
    activityFour: '/images/learning-environment.webp',
    activityFive: '/images/campus-exterior.webp',
    leadership: DEFAULT_STUDENT_ACHIEVEMENT_IMAGE,
    'schoolFaculty-1': '/images/welcome-student.webp',
    'academyFaculty-1': '/images/kindergarten-learning.webp',
  },
};
const CONTENT_IMAGE_SLOTS = new Set([
  'logo', 'hero', 'about', 'activityOne', 'activityTwo', 'activityThree',
  'activityFour', 'activityFive', 'leadership',
]);
const isContentImageSlot = (slot) => CONTENT_IMAGE_SLOTS.has(slot)
  || /^(school|academy)Faculty-[a-z0-9-]{1,60}$/.test(slot);
const MANAGEMENT_CONTACTS = [
  { name: 'Muhammad Saeed Ur Rehman', role: 'CEO', number: '03000555547' },
  { name: 'Muhammad Muneeb Ur Rehman', role: 'FM', number: '03181394588' },
  { name: 'Muhammad Haseeb Ur Rehman', role: 'BM', number: '03178532050' },
];

const allowedOrigins = new Set([
  'https://hiraschoolssc.com',
  'https://www.hiraschoolssc.com',
  ...(process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', async (req, res) => {
  // Health check se backend aur uski zaroori services ka status bina credentials dikhaye milta hai.
  await connectDatabase();
  const checks = {
    database: isDatabaseConnected() ? 'connected' : 'unavailable',
    cloudinary: hasCloudinary() ? 'configured' : 'unavailable',
  };
  const ready = Object.values(checks).every((status) => status !== 'unavailable');
  return res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'degraded',
    checks,
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_GALLERY_IMAGES },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many inquiries. Please try again later.' },
});

function adminOnly(req, res, next) {
  const expectedToken = process.env.ADMIN_TOKEN;
  const suppliedToken = req.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!expectedToken) {
    return res.status(503).json({ message: 'Admin access is not configured on the server.' });
  }
  // Constant-time comparison se response ki speed dekh kar admin token guess karna mushkil hota hai.
  const expectedBuffer = Buffer.from(expectedToken);
  const suppliedBuffer = Buffer.from(suppliedToken || '');
  if (!suppliedToken || suppliedBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(401).json({ message: 'A valid admin token is required.' });
  }
  return next();
}

function validateClassSection(className, section) {
  return CLASSES.has(className) && SECTIONS.has(section);
}

function resultDownloadUrl(req, className, section) {
  const publicApiUrl = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  return `${publicApiUrl}/api/results/${encodeURIComponent(className)}/${encodeURIComponent(section)}/download`;
}

function ensurePdf(file) {
  return Boolean(
    file
    && file.mimetype === 'application/pdf'
    && file.originalname.toLowerCase().endsWith('.pdf')
    && file.buffer.subarray(0, 5).toString() === '%PDF-',
  );
}

function publicSettings(settings) {
  // Default, MongoDB aur environment content merge hote hain; .env values ko aakhri priority milti hai.
  const storedContent = settings?.content && typeof settings.content === 'object' ? settings.content : {};
  const content = {
    ...DEFAULT_CONTENT,
    ...storedContent,
    ...ENV_CONTENT_OVERRIDES,
    images: {
      ...DEFAULT_CONTENT.images,
      ...(storedContent.images || {}),
      ...(ENV_CONTENT_OVERRIDES.images || {}),
    },
  };
  if (STUDENT_ACHIEVEMENT_IMAGE_URL) {
    content.images.activityOne = STUDENT_ACHIEVEMENT_IMAGE_URL;
    content.images.leadership = STUDENT_ACHIEVEMENT_IMAGE_URL;
    content.galleryItems = (content.galleryItems || []).map((item) => (
      item.caption === 'Achievements'
        ? { ...item, url: STUDENT_ACHIEVEMENT_IMAGE_URL }
        : item
    ));
  }
  const navigationLinks = [...(content.navigationLinks || DEFAULT_CONTENT.navigationLinks)];
  for (const [label, href] of [['Academy', '#academy'], ['Faculty', '#faculty']]) {
    if (!navigationLinks.some((item) => item.href === href)) navigationLinks.push({ label, href });
  }
  content.navigationLinks = navigationLinks;
  return {
    liveLocation: process.env.WEBSITE_LOCATION || settings?.liveLocation || DEFAULT_SETTINGS.liveLocation,
    managementContacts: MANAGEMENT_CONTACTS,
    galleryManaged: Boolean(settings?.galleryManaged),
    content,
    galleryLayout: {
      mode: ['grid', 'slider'].includes(storedContent.galleryLayout) ? storedContent.galleryLayout : DEFAULT_CONTENT.galleryLayout,
      columns: Number.isInteger(storedContent.galleryColumns)
        ? Math.min(4, Math.max(2, storedContent.galleryColumns))
        : DEFAULT_CONTENT.galleryColumns,
    },
    gallery: (settings?.gallery || []).map((item) => ({
      id: item._id?.toString(),
      url: item.url,
      alt: item.alt,
      category: item.category || 'Campus',
    })),
  };
}

function validateCmsContent(content) {
  const arrayKeys = [
    'aboutHighlights', 'trustItems', 'benefits', 'academicStages', 'facilities',
    'activities', 'galleryFilters', 'galleryItems', 'leadershipPoints',
    'navigationLinks', 'footerAcademicsLinks', 'socialLinks', 'academyHighlights',
    'academyPrograms', 'schoolFaculty', 'academyFaculty',
  ];
  const structuredKeys = new Set([...arrayKeys, 'images', 'galleryLayout', 'galleryColumns']);
  if (Object.entries(content).some(([key, value]) => (
    !structuredKeys.has(key) && (typeof value !== 'string' || value.length > 5000)
  ))) {
    return 'Homepage text fields must contain text values no longer than 5,000 characters.';
  }
  for (const key of arrayKeys) {
    if (content[key] !== undefined && (!Array.isArray(content[key]) || content[key].length > 30)) {
      return `${key} must be a list of no more than 30 items.`;
    }
  }
  for (const key of ['aboutHighlights', 'galleryFilters', 'leadershipPoints', 'academyHighlights']) {
    if (content[key]?.some((item) => typeof item !== 'string' || item.length > 200)) {
      return `${key} must contain only short text values.`;
    }
  }
  const objectListFields = {
    trustItems: ['title', 'description'],
    benefits: ['icon', 'title', 'description'],
    academicStages: ['icon', 'title', 'classes', 'description'],
    facilities: ['icon', 'title', 'description'],
    activities: ['title', 'imageAlt', 'imageKey'],
    galleryItems: ['url', 'alt', 'caption', 'category'],
    navigationLinks: ['label', 'href'],
    footerAcademicsLinks: ['label', 'href'],
    socialLinks: ['label', 'icon', 'url'],
    academyPrograms: ['title', 'description'],
    schoolFaculty: ['name', 'designation', 'imageKey'],
    academyFaculty: ['name', 'designation', 'imageKey'],
  };
  for (const [key, fields] of Object.entries(objectListFields)) {
    if (content[key]?.some((item) => (
      !item || typeof item !== 'object' || fields.some((field) => (
        item[field] !== undefined && (typeof item[field] !== 'string' || item[field].length > 2000)
      ))
    ))) {
      return `${key} contains an invalid content item.`;
    }
  }
  if (content.galleryFilters && (!content.galleryFilters.length
    || content.galleryFilters.some((filter) => typeof filter !== 'string' || !filter.trim()))) {
    return 'Gallery filters must include at least one non-empty label.';
  }
  if (content.galleryLayout !== undefined && !['grid', 'slider'].includes(content.galleryLayout)) {
    return 'Gallery layout must be grid or slider.';
  }
  if (content.galleryColumns !== undefined
    && (!Number.isInteger(content.galleryColumns) || content.galleryColumns < 2 || content.galleryColumns > 4)) {
    return 'Gallery columns must be between 2 and 4.';
  }
  if (content.images !== undefined
    && (!content.images || typeof content.images !== 'object' || Array.isArray(content.images)
      || Object.entries(content.images).some(([slot, url]) => (
        !isContentImageSlot(slot) || typeof url !== 'string' || url.length > 2000
          || !isCloudinaryImageUrl(url)
      )))) {
    return 'Homepage images must be uploaded to Cloudinary.';
  }
  if (content.mapEmbedUrl !== undefined && (typeof content.mapEmbedUrl !== 'string' || content.mapEmbedUrl.length > 2000)) {
    return 'Enter a valid Google Maps embed URL.';
  }
  if (content.activities?.some((item) => (
    !item || typeof item !== 'object' || !CONTENT_IMAGE_SLOTS.has(item.imageKey)
  ))) {
    return 'Each activity must reference a supported homepage image slot.';
  }
  for (const key of ['schoolFaculty', 'academyFaculty']) {
    const expectedPrefix = key === 'schoolFaculty' ? 'schoolFaculty-' : 'academyFaculty-';
    if (content[key]?.some((item) => (
      !item || typeof item.name !== 'string' || !item.name.trim()
        || !item.imageKey || !item.imageKey.startsWith(expectedPrefix)
        || !isContentImageSlot(item.imageKey)
    ))) {
      return `${key} must include a name and a valid photo slot for each faculty member.`;
    }
  }
  if (content.galleryItems?.some((item) => (
    !item || typeof item !== 'object' || typeof item.url !== 'string'
      || !isCloudinaryImageUrl(item.url)
  ))) {
    return 'Default gallery images must use secure Cloudinary URLs.';
  }
  const safeLinks = [
    ...(content.navigationLinks || []).map((item) => item?.href),
    ...(content.footerAcademicsLinks || []).map((item) => item?.href),
    ...(content.socialLinks || []).map((item) => item?.url),
    content.directionsUrl,
  ].filter((link) => link !== undefined);
  if (safeLinks.some((link) => (
    typeof link !== 'string'
      || !(link.startsWith('/') || link.startsWith('#') || link.startsWith('https://'))
  ))) {
    return 'Website links must use a local path, section anchor, or secure HTTPS URL.';
  }
  if (content.mapEmbedUrl !== undefined) {
    try {
      const mapUrl = new URL(content.mapEmbedUrl);
      if (mapUrl.protocol !== 'https:' || !['google.com', 'www.google.com', 'maps.google.com'].includes(mapUrl.hostname)) {
        return 'The map embed URL must be a secure Google Maps URL.';
      }
    } catch {
      return 'Enter a valid Google Maps embed URL.';
    }
  }
  return '';
}

const STUDENT_ACHIEVEMENT_IMAGE_URL = process.env.STUDENT_ACHIEVEMENT_IMAGE_URL?.trim() || '';
if (STUDENT_ACHIEVEMENT_IMAGE_URL && !isCloudinaryImageUrl(STUDENT_ACHIEVEMENT_IMAGE_URL)) {
  throw new Error('STUDENT_ACHIEVEMENT_IMAGE_URL must be a secure Cloudinary URL.');
}

let ENV_CONTENT_OVERRIDES = {};
if (process.env.WEBSITE_CONTENT_JSON?.trim()) {
  try {
    ENV_CONTENT_OVERRIDES = JSON.parse(process.env.WEBSITE_CONTENT_JSON);
  } catch (error) {
    throw new Error('WEBSITE_CONTENT_JSON must contain valid JSON.', { cause: error });
  }
  if (!ENV_CONTENT_OVERRIDES || typeof ENV_CONTENT_OVERRIDES !== 'object'
    || Array.isArray(ENV_CONTENT_OVERRIDES)) {
    throw new Error('WEBSITE_CONTENT_JSON must be a JSON object.');
  }
  const validationError = validateCmsContent(ENV_CONTENT_OVERRIDES);
  if (validationError) throw new Error(`Invalid WEBSITE_CONTENT_JSON: ${validationError}`);
}

if (process.env.WEBSITE_LOCATION
  && (process.env.WEBSITE_LOCATION.trim().length < 2 || process.env.WEBSITE_LOCATION.trim().length > 300)) {
  throw new Error('WEBSITE_LOCATION must be between 2 and 300 characters.');
}

async function requireDatabase(res) {
  if (await connectDatabase()) return true;
  res.status(503).json({ message: 'The settings database is currently unavailable.' });
  return false;
}

function requireCloudinary(res) {
  if (hasCloudinary()) return true;
  res.status(503).json({ message: 'Cloudinary uploads are not configured on the server.' });
  return false;
}

app.get('/api/config', async (req, res) => {
  if (!await connectDatabase()) {
    return res.json({
      ...publicSettings(null),
      cmsAvailable: false,
      warning: 'The CMS database is unavailable. Preset website content is being shown; admin edits are temporarily unavailable.',
    });
  }
  if (!requireCloudinary(res)) return;
  let settings = await WebsiteSettings.findOneAndUpdate(
    { key: 'main' },
    { $setOnInsert: { key: 'main', ...DEFAULT_SETTINGS, content: DEFAULT_CONTENT } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  ).lean();

  const content = {
    ...DEFAULT_CONTENT,
    ...(settings.content || {}),
    images: { ...DEFAULT_CONTENT.images, ...(settings.content?.images || {}) },
  };
  const imagePublicIds = { ...(settings.contentImagePublicIds || {}) };
  const imagesNeedingUpload = Object.entries(content.images)
    .filter(([, url]) => !isCloudinaryImageUrl(url));

  if (imagesNeedingUpload.length) {
    const uploadedImages = await Promise.all(imagesNeedingUpload.map(async ([slot, url]) => {
      const uploaded = await uploadPresetImage(url, slot);
      return [slot, uploaded];
    }));
    for (const [slot, uploaded] of uploadedImages) {
      content.images[slot] = uploaded.secure_url;
      imagePublicIds[slot] = uploaded.public_id;
    }
  }

  let galleryItemsChanged = false;
  content.galleryItems = await Promise.all((content.galleryItems || []).map(async (item, index) => {
    if (isCloudinaryImageUrl(item.url)) return item;

    const matchingSlot = Object.keys(DEFAULT_CONTENT.images)
      .find((slot) => DEFAULT_CONTENT.images[slot] === item.url && isCloudinaryImageUrl(content.images[slot]));
    if (matchingSlot) {
      galleryItemsChanged = true;
      return { ...item, url: content.images[matchingSlot] };
    }

    const uploaded = await uploadPresetImage(item.url, `gallery-default-${index + 1}`);
    imagePublicIds[`galleryDefault${index + 1}`] = uploaded.public_id;
    galleryItemsChanged = true;
    return { ...item, url: uploaded.secure_url };
  }));

  if (imagesNeedingUpload.length || galleryItemsChanged) {
    settings = await WebsiteSettings.findOneAndUpdate(
      { key: 'main' },
      { $set: { content, contentImagePublicIds: imagePublicIds } },
      { returnDocument: 'after' },
    ).lean();
  }
  return res.json({
    ...publicSettings(settings),
    cmsAvailable: true,
    warning: '',
  });
});

function buildManagementMessage(category, values) {
  return [
    `${category} (HIRA SCHOOL SHAMIM SAEED CAMPUS${category === 'contact' ? ' (Contact)' : ''}`,
    `Name: ${values.name}`,
    `Father name: ${values.fatherName}`,
    `Phone: ${values.phone}`,
    values.email ? `Email: ${values.email}` : '',
    `Message: ${values.message}`,
  ].filter(Boolean).join('\n');
}

async function sendManagementMessage(message) {
  if (!process.env.GREEN_API_INSTANCE_ID || !process.env.GREEN_API_TOKEN) {
    return { configured: false, failedRoles: MANAGEMENT_CONTACTS.map(({ role }) => role) };
  }

  const apiBase = (process.env.GREEN_API_BASE_URL || 'https://api.green-api.com').replace(/\/+$/, '');
  const endpoint = `${apiBase}/waInstance${encodeURIComponent(process.env.GREEN_API_INSTANCE_ID)}`
    + `/sendMessage/${encodeURIComponent(process.env.GREEN_API_TOKEN)}`;
  const outcomes = await Promise.allSettled(MANAGEMENT_CONTACTS.map(async (contact) => {
    const recipient = contact.number.replace(/\D/g, '');
    const recipientIntl = recipient.startsWith('0') ? `92${recipient.slice(1)}` : recipient;
    await axios.post(endpoint, {
      chatId: `${recipientIntl}@c.us`,
      message,
    }, { timeout: 12_000 });
    return contact.role;
  }));
  const failedRoles = outcomes.flatMap((outcome, index) => (
    outcome.status === 'rejected' ? [MANAGEMENT_CONTACTS[index].role] : []
  ));
  if (failedRoles.length) {
    console.error('WhatsApp message delivery failed for:', failedRoles.join(', '));
  }
  return { configured: true, failedRoles };
}

app.post(['/api/contact-us', '/api/contact'], contactLimiter, async (req, res) => {
  const name = typeof req.body?.name === 'string'
    ? req.body.name.trim().replace(/\s+/g, ' ')
    : '';
  const fatherName = typeof req.body?.fatherName === 'string' ? req.body.fatherName.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';

  if (name.length < 2 || name.length > 100
    || fatherName.length < 2 || fatherName.length > 100
    || phone.length < 5 || phone.length > 30
    || email.length > 254
    || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    || message.length < 5 || message.length > 2000
  ) {
    return res.status(400).json({ message: 'Please provide a valid name, father name, phone, and message.' });
  }

  const delivery = await sendManagementMessage(buildManagementMessage('contact', {
    name, fatherName, phone, email, message,
  }));
  if (!delivery.configured) {
    return res.status(503).json({ message: 'The inquiry messaging service is not configured.' });
  }
  if (delivery.failedRoles.length) {
    return res.status(502).json({
      message: 'The inquiry could not be delivered to all management contacts. Please try again.',
    });
  }

  return res.status(202).json({ message: 'Your inquiry was sent to the school management team.' });
});

app.post('/api/admission-notification', contactLimiter, async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : '';
  const fatherName = typeof req.body?.fatherName === 'string' ? req.body.fatherName.trim() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (name.length < 2 || name.length > 100 || fatherName.length < 2 || fatherName.length > 100
    || phone.length < 5 || phone.length > 30 || email.length > 254
    || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    || message.length > 2000) {
    return res.status(400).json({ message: 'Please provide valid admission contact details.' });
  }

  // Is endpoint mein admission details sirf WhatsApp par jati hain; MongoDB mein save nahi hotin.
  const delivery = await sendManagementMessage(buildManagementMessage('admission', {
    name, fatherName, phone, email, message,
  }));
  if (!delivery.configured) {
    return res.status(503).json({ message: 'The admission messaging service is not configured.' });
  }
  if (delivery.failedRoles.length) {
    return res.status(502).json({
      message: 'The admission details could not be delivered to all management contacts. Please retry.',
    });
  }
  return res.status(202).json({ message: 'The admission form was sent to the school management team.' });
});

app.get('/api/results', async (req, res) => {
  const className = typeof req.query.class === 'string' ? req.query.class : '';
  const section = typeof req.query.section === 'string' ? req.query.section : '';
  if (!validateClassSection(className, section)) {
    return res.status(400).json({ message: 'Select a supported class and section.' });
  }
  if (!await requireDatabase(res)) return;

  const result = await ResultSheet.findOne({ className, section }).lean();
  if (!result) return res.status(404).json({ message: 'No result sheet is published for this class and section.' });
  return res.json({ className, section, url: resultDownloadUrl(req, className, section) });
});

app.get('/api/results/:className/:section/download', async (req, res) => {
  const { className, section } = req.params;
  if (!validateClassSection(className, section)) {
    return res.status(400).json({ message: 'Select a supported class and section.' });
  }
  if (!await requireDatabase(res) || !requireCloudinary(res)) return;

  const result = await ResultSheet.findOne({ className, section }).lean();
  if (!result) return res.status(404).json({ message: 'No result sheet is published for this class and section.' });

  const signedUrl = cloudinary.utils.private_download_url(result.publicId, 'pdf', {
    resource_type: 'raw',
    type: 'upload',
    expires_at: Math.floor(Date.now() / 1000) + 300,
  });
  res.set('Cache-Control', 'private, no-store');
  return res.redirect(302, signedUrl);
});

app.get('/api/admin/status', adminOnly, (req, res) => (
  res.json({ authenticated: true })
));

app.patch('/api/admin/settings', adminOnly, async (req, res) => {
  const liveLocation = typeof req.body?.liveLocation === 'string'
    ? req.body.liveLocation.trim()
    : undefined;
  const content = req.body?.content;
  if (liveLocation !== undefined && (liveLocation.length < 2 || liveLocation.length > 300)) {
    return res.status(400).json({ message: 'Location must be between 2 and 300 characters.' });
  }
  if (content !== undefined
    && (!content || typeof content !== 'object' || Array.isArray(content)
      || Buffer.byteLength(JSON.stringify(content), 'utf8') > 100_000)) {
    return res.status(400).json({ message: 'Website content must be a JSON object under 100 KB.' });
  }
  if (content !== undefined) {
    const validationError = validateCmsContent(content);
    if (validationError) return res.status(400).json({ message: validationError });
  }
  if (liveLocation === undefined && content === undefined) {
    return res.status(400).json({ message: 'Provide a location or website content to save.' });
  }
  if (!await requireDatabase(res)) return;

  const currentSettings = await WebsiteSettings.findOne({ key: 'main' }).lean();
  const updates = {};
  if (liveLocation !== undefined) updates.liveLocation = liveLocation;
  if (content !== undefined) {
    updates.content = {
      ...DEFAULT_CONTENT,
      ...(currentSettings?.content || {}),
      ...content,
      images: {
        ...DEFAULT_CONTENT.images,
        ...(currentSettings?.content?.images || {}),
        ...(content.images || {}),
      },
    };
  }
  const settings = await WebsiteSettings.findOneAndUpdate(
    { key: 'main' },
    { $set: updates, $setOnInsert: { key: 'main', gallery: [] } },
    { returnDocument: 'after', upsert: true, runValidators: true },
  );
  return res.json(publicSettings(settings));
});

app.post('/api/admin/content-image/:slot', adminOnly, upload.single('image'), async (req, res) => {
  const { slot } = req.params;
  if (!isContentImageSlot(slot)) {
    return res.status(400).json({ message: 'Select a supported homepage image slot.' });
  }
  if (!req.file || !IMAGE_MIME_TYPES.has(req.file.mimetype)) {
    return res.status(400).json({ message: 'Choose a JPG, PNG, or WebP image.' });
  }
  if (!await requireDatabase(res) || !requireCloudinary(res)) return;

  const current = await WebsiteSettings.findOne({ key: 'main' }).lean();
  const previousPublicId = current?.contentImagePublicIds?.[slot];
  const uploaded = await uploadToCloudinary(req.file.buffer, {
    folder: 'hira-school/homepage',
    public_id: slot,
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  });
  const settings = await WebsiteSettings.findOneAndUpdate(
    { key: 'main' },
    {
      $set: {
        [`content.images.${slot}`]: uploaded.secure_url,
        [`contentImagePublicIds.${slot}`]: uploaded.public_id,
      },
      $setOnInsert: {
        key: 'main',
        liveLocation: DEFAULT_SETTINGS.liveLocation,
      },
    },
    { returnDocument: 'after', upsert: true },
  );

  if (previousPublicId && previousPublicId !== uploaded.public_id) {
    await deleteCloudinaryAsset(previousPublicId);
  }
  return res.json(publicSettings(settings));
});

app.post('/api/admin/gallery', adminOnly, upload.array('images', MAX_GALLERY_IMAGES), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: 'Choose at least one image to upload.' });
  }
  if (req.files.some((file) => !IMAGE_MIME_TYPES.has(file.mimetype))) {
    return res.status(400).json({ message: 'Only JPG, PNG, and WebP files can be added to the gallery.' });
  }
  const category = typeof req.body?.category === 'string' ? req.body.category.trim() : '';
  if (!await requireDatabase(res) || !requireCloudinary(res)) return;

  const current = await WebsiteSettings.findOneAndUpdate(
    { key: 'main' },
    { $setOnInsert: { key: 'main', ...DEFAULT_SETTINGS, content: DEFAULT_CONTENT } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );
  const galleryFilters = current.content?.galleryFilters || DEFAULT_CONTENT.galleryFilters;
  if (!category || !galleryFilters.includes(category) || category === galleryFilters[0]) {
    return res.status(400).json({ message: 'Select a valid gallery category.' });
  }
  if (current.gallery.length + req.files.length > MAX_GALLERY_IMAGES) {
    return res.status(409).json({
      message: `The gallery can contain no more than ${MAX_GALLERY_IMAGES} images.`,
    });
  }

  const uploadedAssets = [];
  try {
    for (const file of req.files) {
      const uploaded = await uploadToCloudinary(file.buffer, {
        folder: 'hira-school/gallery',
        resource_type: 'image',
        overwrite: false,
        unique_filename: true,
      });
      uploadedAssets.push({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        alt: file.originalname.replace(/\.[^.]+$/, '').slice(0, 120) || 'School campus',
        category,
      });
    }

    // Upload ke dauran doosri request bhi aa sakti hai, is liye DB update par limit dobara atomically check hoti hai.
    const updated = await WebsiteSettings.findOneAndUpdate(
      {
        key: 'main',
        $expr: {
          $lte: [
            { $size: { $ifNull: ['$gallery', []] } },
            MAX_GALLERY_IMAGES - uploadedAssets.length,
          ],
        },
      },
      {
        $set: { galleryManaged: true },
        $push: { gallery: { $each: uploadedAssets } },
      },
      { returnDocument: 'after', runValidators: true },
    );
    if (!updated) {
      await Promise.all(uploadedAssets.map((asset) => deleteCloudinaryAsset(asset.publicId)));
      return res.status(409).json({
        message: `The gallery can contain no more than ${MAX_GALLERY_IMAGES} images.`,
      });
    }
    return res.status(201).json(publicSettings(updated));
  } catch (error) {
    await Promise.allSettled(uploadedAssets.map((asset) => deleteCloudinaryAsset(asset.publicId)));
    throw error;
  }
});

app.delete('/api/admin/gallery/:imageId', adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.imageId)) {
    return res.status(400).json({ message: 'Invalid gallery image.' });
  }
  if (!await requireDatabase(res) || !requireCloudinary(res)) return;

  const settings = await WebsiteSettings.findOne({ key: 'main' });
  const image = settings?.gallery.id(req.params.imageId);
  if (!image) return res.status(404).json({ message: 'Gallery image not found.' });

  await deleteCloudinaryAsset(image.publicId);
  settings.gallery.pull({ _id: image._id });
  await settings.save();
  return res.json(publicSettings(settings));
});

app.get('/api/admin/results', adminOnly, async (req, res) => {
  if (!await requireDatabase(res)) return;
  const results = await ResultSheet.find().sort({ className: 1, section: 1 }).lean();
  return res.json(results.map(({ className, section, url, updatedAt }) => ({
    className,
    section,
    url: resultDownloadUrl(req, className, section),
    updatedAt,
  })));
});

app.delete('/api/admin/results/:className/:section', adminOnly, async (req, res) => {
  const { className, section } = req.params;
  if (!validateClassSection(className, section)) {
    return res.status(400).json({ message: 'Select a supported class and section.' });
  }
  if (!await requireDatabase(res) || !requireCloudinary(res)) return;

  const result = await ResultSheet.findOne({ className, section });
  if (!result) return res.status(404).json({ message: 'The selected result sheet was not found.' });

  await deleteCloudinaryAsset(result.publicId, 'raw');
  await ResultSheet.deleteOne({ _id: result._id });
  return res.json({ message: `${className}, Section ${section} result sheet removed.` });
});

app.post(['/api/admin/upload-result', '/api/admin/results'], adminOnly, upload.single('file'), async (req, res) => {
  const className = typeof req.body?.className === 'string' ? req.body.className : '';
  const section = typeof req.body?.section === 'string' ? req.body.section : '';
  if (!validateClassSection(className, section)) {
    return res.status(400).json({ message: 'Select a supported class and section.' });
  }
  if (!ensurePdf(req.file)) {
    return res.status(400).json({ message: 'Choose a valid PDF result sheet.' });
  }
  if (!await requireDatabase(res) || !requireCloudinary(res)) return;

  // Class aur section se mustaqil Cloudinary ID banti hai; nayi upload usi PDF ko replace karti hai.
  const publicId = `hira-school/results/${className}_${section}.pdf`;
  const uploaded = await uploadToCloudinary(req.file.buffer, {
    public_id: publicId,
    resource_type: 'raw',
    overwrite: true,
    invalidate: true,
  });
  const previous = await ResultSheet.findOne({ className, section }).lean();
  const result = await ResultSheet.findOneAndUpdate(
    { className, section },
    { $set: { url: uploaded.secure_url, publicId } },
    { returnDocument: 'after', upsert: true, runValidators: true },
  );
  if (previous?.publicId && previous.publicId !== publicId) {
    await deleteCloudinaryAsset(previous.publicId, 'raw');
  }
  return res.status(200).json({
    className: result.className,
    section: result.section,
    url: resultDownloadUrl(req, result.className, result.section),
    updatedAt: result.updatedAt,
  });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({
      message: error.code === 'LIMIT_FILE_SIZE'
        ? 'Files must be 12 MB or smaller.'
        : `Upload rejected: ${error.message}.`,
    });
  }
  if (error.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ message: error.message });
  }
  console.error('Request failed:', error);
  return res.status(500).json({ message: 'The server could not complete the request.' });
});

connectDatabase();

// Local mein Express apna port kholta hai; Vercel par platform exported app ko khud serve karta hai.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`School API listening on port ${PORT}`);
  });
}

module.exports = app;
