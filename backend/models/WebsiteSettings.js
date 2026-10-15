const mongoose = require('mongoose');

// Website ka text, image URLs, address aur gallery isi aik settings record mein rehte hain.
const websiteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  liveLocation: { type: String, default: '' },
  galleryManaged: { type: Boolean, default: false },
  content: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  contentImagePublicIds: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  gallery: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: 'School campus' },
    category: { type: String, default: 'Campus' },
  }],
}, { timestamps: true });

module.exports = mongoose.models.WebsiteSettings
  || mongoose.model('WebsiteSettings', websiteSettingsSchema);
