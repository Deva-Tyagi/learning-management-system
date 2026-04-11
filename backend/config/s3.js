const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

// Configure S3 Storage Engine for Multer
const s3Storage = (folder) => multerS3({
  s3: s3Client,
  bucket: process.env.AWS_BUCKET_NAME || process.env.AWS_BUCKET,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    cb(null, `crm/${folder}/${fileName}`);
  },
});

// Helper to generate Presigned URLs for private files
const getPresignedUrl = async (key) => {
  if (!key) return null;
  // If it's already a full URL, we might want to extract the key or ignore
  if (key.startsWith('http')) {
      try {
          // Extract key from S3 URL format: https://bucket.s3.region.amazonaws.com/key
          const url = new URL(key);
          key = url.pathname.substring(1); // remove leading slash
      } catch (e) {
          return key; // return as is if not a valid URL
      }
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || process.env.AWS_BUCKET,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
    return url;
  } catch (err) {
    console.error('[S3_ERROR] getPresignedUrl failed:', {
      message: err.message,
      bucket: process.env.AWS_BUCKET_NAME || process.env.AWS_BUCKET,
      key: key,
      region: process.env.AWS_REGION
    });
    return null;
  }
};

const uploadImage = multer({ storage: s3Storage('images') });
const uploadDocument = multer({ storage: s3Storage('documents') });

module.exports = {
  s3Client,
  uploadImage,
  uploadDocument,
  getPresignedUrl,
};
