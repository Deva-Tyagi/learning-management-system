const mongoose = require('mongoose');
const IdCard = require('../models/IdCard');
const Student = require('../models/Student');
const { createIdCardPdfBuffer } = require('../utils/idCardPdf');
const { getPresignedUrl } = require('../config/s3');

/**
 * Admin: Issue (create) an ID card for a student.
 * Only if there is no active card for this student.
 */
exports.issueIdCard = async (req, res) => {
  try {
    const { studentId, validThrough, templateId } = req.body;
    if (!studentId) return res.status(400).json({ msg: "studentId required" });

    const newStudentId = new mongoose.Types.ObjectId(studentId);

    // Only one active ID card per student
    const duplicate = await IdCard.findOne({ studentId: newStudentId, status: 'active' });
    if (duplicate) return res.status(400).json({ msg: "ID Card already exists for this student." });

    const idCard = new IdCard({
      studentId: newStudentId,
      issuedBy: req.user.id,
      validThrough,
      template: templateId || undefined // Use template reference
    });
    await idCard.save();
    
    // Populate and sign for immediate UI update if needed
    const populated = await IdCard.findById(idCard._id).populate('studentId').populate('template');
    const c = populated.toObject();
    if (c.studentId && c.studentId.photo) {
      c.studentId.photo = await getPresignedUrl(c.studentId.photo);
    }

    res.status(201).json({ msg: 'ID Card issued', idCard: c });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

// Bulk issue ID cards by student IDs (skip already active students)
exports.bulkIssueIdCards = async (req, res) => {
  try {
    const { studentIds, validThrough, templateId } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ msg: 'studentIds array is required' });
    }

    const issued = [];
    const skipped = [];

    for (const studentId of studentIds) {
      const newStudentId = new mongoose.Types.ObjectId(studentId);
      const duplicate = await IdCard.findOne({ studentId: newStudentId, status: 'active' });
      if (duplicate) {
        skipped.push(studentId);
        continue;
      }
      const idCard = new IdCard({
        studentId: newStudentId,
        issuedBy: req.user.id,
        validThrough,
        template: templateId || undefined // Apply the selected template
      });
      await idCard.save();
      issued.push(idCard);
    }

    res.status(201).json({ msg: 'Bulk ID card issue completed', issued, skipped });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

/**
 * Admin: List all ID cards (with student info).
 * Student: Only their own cards.
 */
exports.listIdCards = async (req, res) => {
  try {
    let query = {};
    // Admins see cards they issued; students see their own cards
    if (req.user.isAdmin) {
      query = { issuedBy: req.user.id };
    } else {
      // student logic
      query = { studentId: new mongoose.Types.ObjectId(req.user.id) };
    }
    const idCards = await IdCard.find(query).populate('studentId').populate('template');
    
    // Sign student photo URLs
    const signedCards = await Promise.all(idCards.map(async (card) => {
      const c = card.toObject();
      if (c.studentId && c.studentId.photo) {
        c.studentId.photo = await getPresignedUrl(c.studentId.photo);
      }
      return c;
    }));

    res.json(signedCards);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

/**
 * Student: Get all their own ID cards (for direct match like certificates).
 */
exports.getStudentIdCards = async (req, res) => {
  try {
  const { studentId } = req.params;
    const idCards = await IdCard.find({ studentId: new mongoose.Types.ObjectId(studentId) }).populate('studentId').populate('template');
    
    const signedCards = await Promise.all(idCards.map(async (card) => {
      const c = card.toObject();
      if (c.studentId && c.studentId.photo) {
        c.studentId.photo = await getPresignedUrl(c.studentId.photo);
      }
      return c;
    }));

    res.json(signedCards);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

/**
 * Admin: Update status or validity of an ID card.
 */
exports.updateIdCard = async (req, res) => {
  try {
    const idCard = await IdCard.findById(req.params.id);
    if (!idCard) return res.status(404).json({ msg: "ID Card not found." });

    if (typeof req.body.validThrough !== "undefined") idCard.validThrough = req.body.validThrough;
    if (typeof req.body.status !== "undefined") idCard.status = req.body.status;

    await idCard.save();
    res.json(idCard);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

/**
 * Admin: Delete/Revoke an ID card.
 */
exports.deleteIdCard = async (req, res) => {
  try {
    const del = await IdCard.findOneAndDelete({
      _id: req.params.id,
      issuedBy: req.user.id
    });
    if (!del) return res.status(404).json({ msg: 'ID Card not found or unauthorized' });
    res.json({ msg: 'ID Card deleted' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

/**
 * Admin or Student: Download PDF of an ID card.
 * Admin: any card; Student: their own active card only.
 */
exports.downloadIdCardPdf = async (req, res) => {
  try {
    const idCard = await IdCard.findById(req.params.id).populate('studentId');
    if (!idCard) return res.status(404).json({ msg: "ID Card not found." });

    // Pre-sign the student photo if it's an S3 link so createIdCardPdfBuffer can fetch it
    if (idCard.studentId && idCard.studentId.photo) {
        idCard.studentId.photo = await getPresignedUrl(idCard.studentId.photo);
    }

    // Only admin or the student themself
    const userId = req.user.id || (req.user.user && req.user.user.id);
if (
  !req.user.isAdmin &&
  String(userId) !== String(idCard.studentId._id)
) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    if (idCard.status !== 'active') return res.status(403).json({ msg: "ID Card revoked." });

    // Compose institution info for the card (customize as needed)
    const institution = {
      name: "My Institute",
      tagline: "Excellence & Trust",
      address: "www.example.com • info@example.com",
      logoPath: "public/your-logo.png", // Make sure this path is valid
      verifyUrl: "https://your-frontend.com/verify-id"
    };

    const pdfBuffer = await createIdCardPdfBuffer(idCard.studentId, institution);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=IDCard-${idCard.studentId.name.replace(/\s/g, '')}.pdf`
    });
    res.send(pdfBuffer);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
