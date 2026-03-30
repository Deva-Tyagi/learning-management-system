const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/Student');
const fs = require('fs');

async function checkStudents() {
  let output = '';
  try {
    await mongoose.connect(process.env.MONGO_URI);
    output += 'Connected to MongoDB\n';
    
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    
    output += `Total Students: ${totalStudents}\n`;
    output += `isActive: true Students: ${activeStudents}\n`;
    
    const allStudents = await Student.find().limit(5);
    output += 'Top 5 Students:\n';
    allStudents.forEach(s => {
      output += `- ${s.name}: isActive=${s.isActive}, phone=${s.phone}, email=${s.email}\n`;
    });
    
    fs.writeFileSync('diagnostic_output.txt', output);
    console.log('Diagnostic output written to diagnostic_output.txt');
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('diagnostic_error.txt', err.toString());
    console.error('Diagnostic error:', err);
    process.exit(1);
  }
}

checkStudents();
