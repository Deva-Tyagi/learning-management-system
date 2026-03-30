const Marksheet = require('../models/Marksheet');

exports.bulkIssueMarksheets = async (req, res) => {
  try {
    const { studentIds, course, template, marks } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ msg: 'studentIds array is required' });
    }
    if (!course) {
      return res.status(400).json({ msg: 'course is required' });
    }

    const issued = [];
    const skipped = [];
    for (const studentId of studentIds) {
      const existing = await Marksheet.findOne({ studentId, course, status: 'active' });
      if (existing) {
        skipped.push(studentId);
        continue;
      }
      const marksheet = new Marksheet({
        studentId,
        course,
        template: template || 'default',
        marks: Array.isArray(marks) ? marks : [],
        generatedBy: req.user.id,
      });
      await marksheet.save();
      issued.push(marksheet);
    }
    res.status(201).json({ msg: 'Bulk marksheets issued', issued, skipped });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.listMarksheets = async (req, res) => {
  try {
    const marksheets = await Marksheet.find({ generatedBy: req.user.id })
      .populate('studentId', 'name rollNumber course batch')
      .populate('template');
    res.json(marksheets);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.downloadMarksheetPdf = async (req, res) => {
  try {
    const marksheet = await Marksheet.findById(req.params.id).populate('studentId');
    if (!marksheet) return res.status(404).json({ msg: 'Marksheet not found' });

    const text = `Marksheet for ${marksheet.studentId.name} (${marksheet.course})`;
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => res.send(Buffer.concat(chunks)));

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="Marksheet-${marksheet._id}.pdf"` });
    doc.font('Helvetica-Bold').fontSize(20).text('Marksheet', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(14).text(text);
    if (marksheet.marks && marksheet.marks.length) {
      doc.moveDown().font('Helvetica-Bold').text('Subject Scores:');
      marksheet.marks.forEach(m => doc.font('Helvetica').fontSize(12).text(`${m.subject}: ${m.score}/${m.max}`));
    }
    doc.end();
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
