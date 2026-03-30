const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage Engine for Images (Photos, Signatures, etc.)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'crm/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

// Configure Storage Engine for Documents (PDFs, Docs)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'crm/documents',
      resource_type: 'auto',
      public_id: Date.now() + '-' + file.originalname.split('.')[0],
    };
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadDocument = multer({ storage: documentStorage });

module.exports = {
  cloudinary,
  uploadImage,
  uploadDocument,
};
