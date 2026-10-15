const fs = require('node:fs/promises');
const path = require('node:path');
const { v2: cloudinary } = require('cloudinary');

// Credentials .env se load hote hain; secret values code ya response mein expose nahi hoti.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function hasCloudinary() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET,
  );
}

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    // Multer file memory mein deta hai, is liye buffer ko Cloudinary stream mein bhejte hain.
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

function isCloudinaryImageUrl(url) {
  return typeof url === 'string' && url.startsWith('https://res.cloudinary.com/');
}

async function uploadPresetImage(url, publicId) {
  // Sirf bundled /images presets ko Cloudinary mein seed karte hain; arbitrary path read nahi hota.
  const publicDirectory = path.resolve(__dirname, '../frontend/public');
  const imagePath = path.resolve(publicDirectory, `.${url}`);
  if (!url.startsWith('/images/') || !imagePath.startsWith(`${publicDirectory}${path.sep}`)) {
    throw new Error(`The preset image path is invalid: ${url}`);
  }

  const imageBuffer = await fs.readFile(imagePath);
  return uploadToCloudinary(imageBuffer, {
    folder: 'hira-school/homepage',
    public_id: publicId,
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  });
}

async function deleteCloudinaryAsset(publicId, resourceType = 'image') {
  if (!publicId) return;
  // Results Cloudinary par raw assets hain, jabke baqi site media image resources hain.
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}

module.exports = {
  cloudinary,
  deleteCloudinaryAsset,
  hasCloudinary,
  isCloudinaryImageUrl,
  uploadPresetImage,
  uploadToCloudinary,
};
