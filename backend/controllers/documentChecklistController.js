const Student = require('../models/Student');
const IdCard = require('../models/IdCard');
const Certificate = require('../models/Certificate');
const AdmitCard = require('../models/AdmitCard');
const Marksheet = require('../models/Marksheet');
const Exam = require('../models/Exam');

exports.getPendingDocuments = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // 1. Students without ID Card
    const allStudents = await Student.find({ adminId, isActive: true }).select('name rollNumber batch course');
    const issuedIdCards = await IdCard.find({ adminId }).distinct('studentId');
    const missingIdCards = allStudents.filter(s => !issuedIdCards.includes(s._id.toString()));

    // 2. Completed Students without Certificate
    const completedStudents = await Student.find({ adminId, status: 'Completed' }).select('name rollNumber batch course');
    const issuedCerts = await Certificate.find({ adminId }).distinct('studentId');
    const missingCerts = completedStudents.filter(s => !issuedCerts.includes(s._id.toString()));

    // 3. Marksheets pending (Completed students without Marksheet)
    const issuedMarksheets = await Marksheet.find({ adminId }).distinct('studentId');
    const missingMarksheets = completedStudents.filter(s => !issuedMarksheets.includes(s._id.toString()));

    res.json({
      missingIdCards,
      missingCerts,
      missingMarksheets
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching checklist', error: error.message });
  }
};
