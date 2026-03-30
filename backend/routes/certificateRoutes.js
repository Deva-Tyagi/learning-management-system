const express = require('express');
const router = express.Router();
const { 
  createCertificate, 
  getCertificates, 
  getStudentCertificates,
  generateCertificatePdf,
  deleteCertificate,
  bulkIssueCertificates
} = require('../controllers/certificateController');
const auth = require('../middleware/authMiddleware');

// Issue a certificate
router.post('/issue', auth, createCertificate);
router.post('/bulk-issue', auth, bulkIssueCertificates);

// Get all certificates (admin)
router.get('/', auth, getCertificates);

// Get all certificates for given student (student)
router.get('/student/:studentId', auth, getStudentCertificates);

// Download/generate PDF for a certificate (admin or student)
router.get('/:id/pdf', auth, generateCertificatePdf);

// Delete certificate
router.delete('/:id', auth, deleteCertificate);

module.exports = router;
