const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const { createCertificatePdfBuffer } = require('../utils/certificatePdf'); // We'll define this utility for PDF generation
const { getPresignedUrl } = require('../config/s3');

// Issue a certificate
exports.createCertificate = async (req, res) => {
  try {
    const { studentId, course, grade, remarks, template } = req.body;

    if (!studentId || !course)
      return res.status(400).json({ msg: 'Student and course are required' });

    // Check if cert for this student+course already exists
    let exists = await Certificate.findOne({ studentId, course, adminId: req.user.id });
    if (exists)
      return res.status(400).json({ msg: 'Certificate already exists for this student/course!' });

    const certNumber = 'CERT-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

    const cert = new Certificate({
      studentId,
      course,
      grade,
      remarks,
      template,
      certificateNumber: certNumber,
      issuedBy: req.user.id,
      adminId: req.user.id
    });
    await cert.save();

    res.status(201).json({ msg: 'Certificate issued successfully', certificate: cert });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// List all certificates (admin)
exports.getCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ adminId: req.user.id })
      .populate('studentId', 'name email course batch rollNumber photo')
      .populate('template')
      .sort({ issueDate: -1 });
    
    // Sign URLs
    const signedCerts = await Promise.all(certs.map(async (cert) => {
        const c = cert.toObject();
        if (c.studentId && c.studentId.photo) {
            c.studentId.photo = await getPresignedUrl(c.studentId.photo);
        }
        return c;
    }));

    res.json(signedCerts);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get certificates for a student (student)
exports.getStudentCertificates = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const Student = require('../models/Student');
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    const certs = await Certificate.find({ studentId, adminId: student.adminId })
        .populate('studentId', 'name course rollNumber batch photo fatherName guardianName phone dob')
        .populate('template')
        .sort({ issueDate: -1 });

    const signedCerts = await Promise.all(certs.map(async (cert) => {
      const c = cert.toObject();
      if (c.studentId && c.studentId.photo) {
        c.studentId.photo = await getPresignedUrl(c.studentId.photo);
      }
      return c;
    }));

    res.json(signedCerts);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Generate/download PDF
exports.generateCertificatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findOne({ _id: id, adminId: req.user.id }).populate('studentId', 'name course rollNumber batch');
    if (!cert) return res.status(404).json({ msg: 'Certificate not found' });
    const pdfBuffer = await createCertificatePdfBuffer(cert);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Certificate-${cert.certificateNumber}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Delete certificate (admin)
exports.deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOneAndDelete({ _id: req.params.id, adminId: req.user.id });
    if (!cert) return res.status(404).json({ msg: 'Certificate not found' });
    res.json({ msg: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.bulkIssueCertificates = async (req, res) => {
  try {
    const { studentIds, course, grade, remarks, template } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ msg: 'studentIds array is required' });
    }
    if (!course) {
      return res.status(400).json({ msg: 'course is required' });
    }

    const issued = [];
    const skipped = [];

    for (const studentId of studentIds) {
      const existing = await Certificate.findOne({ studentId, course, adminId: req.user.id });
      if (existing) {
        skipped.push(studentId);
        continue;
      }
      const certNumber = 'CERT-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      const cert = new Certificate({
        studentId,
        course,
        grade: grade || '',
        remarks: remarks || '',
        template: template || 'default',
        certificateNumber: certNumber,
        issuedBy: req.user.id,
        adminId: req.user.id
      });
      await cert.save();
      issued.push(cert);
    }

    res.status(201).json({ msg: 'Bulk certificates issued', issued, skipped });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
