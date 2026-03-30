const AdmitCard = require('../models/AdmitCard');
const Student = require('../models/Student');

exports.bulkIssueAdmitCards = async (req, res) => {
  try {
    const { studentIds, course, template } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ msg: 'studentIds array is required' });
    }
    if (!course) {
      return res.status(400).json({ msg: 'course is required' });
    }

    const issued = [];
    const skipped = [];
    for (const studentId of studentIds) {
      const existing = await AdmitCard.findOne({ studentId, course, status: 'active' });
      if (existing) {
        skipped.push(studentId);
        continue;
      }

      const admit = new AdmitCard({
        studentId,
        course,
        template: template || 'default',
        generatedBy: req.user.id,
      });
      await admit.save();
      issued.push(admit);
    }
    res.status(201).json({ msg: 'Bulk admit cards issued', issued, skipped });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.listAdmitCards = async (req, res) => {
  try {
    const cards = await AdmitCard.find({ generatedBy: req.user.id })
      .populate('studentId', 'name rollNumber course batch')
      .populate('template');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.downloadAdmitCardPdf = async (req, res) => {
  try {
    const card = await AdmitCard.findById(req.params.id).populate('studentId');
    if (!card) return res.status(404).json({ msg: 'Admit Card not found' });

    // Simple PDF response stub - could integrate dedicated PDF generator.
    const text = `Admit Card: ${card.studentId.name} - ${card.course} - ${new Date(card.issueDate).toLocaleDateString()}`;
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="AdmitCard-${card._id}.pdf"` });
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => res.send(Buffer.concat(chunks)));
    doc.font('Helvetica-Bold').fontSize(20).text('Admit Card', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(14).text(text);
    doc.end();
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
