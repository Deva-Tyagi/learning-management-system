const { uploadImage, uploadDocument } = require('../config/s3');

// Export different upload configurations
module.exports = {
  upload: uploadImage,           // General image upload (now S3)
  courseUpload: uploadImage,     // Course-specific upload (now S3)
  documentUpload: uploadDocument,   // For documents/notes (now S3)
  
  // Individual middleware functions
  single: (name) => uploadImage.single(name),
  multiple: (name) => uploadImage.array(name),
  
  // Course-specific middleware
  courseSingle: (name) => uploadImage.single(name),
  courseMultiple: (name) => uploadImage.array(name),
  
  // Document middleware
  documentSingle: (name) => uploadDocument.single(name),
  documentMultiple: (name) => uploadDocument.array(name)
};
