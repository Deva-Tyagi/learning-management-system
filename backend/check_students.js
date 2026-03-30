const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/Student');

async function checkStudents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const statusActiveStudents = await Student.countDocuments({ status: 'Active' });
    
    if (totalStudents > 0) {
      const sample = await Student.findOne();
      console.log('Sample Student Fields:', Object.keys(sample.toObject()));
      console.log('Sample Student Values:', {
        name: sample.name,
        isActive: sample.isActive,
        status: sample.status,
        phone: sample.phone,
        email: sample.email
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStudents();
