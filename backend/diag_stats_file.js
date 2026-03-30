const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

async function diag() {
  const logFile = path.join(__dirname, 'diag_output.txt');
  function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
  }

  try {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    log('Starting diag...');

    dotenv.config({ path: path.join(__dirname, '.env') });
    await mongoose.connect(process.env.MONGO_URI);
    log('Connected to DB');

    const Student = require('./models/Student');
    const Fee = require('./models/Fee');
    const Admin = require('./models/Admin');

    const admin = await Admin.findOne();
    log('--- ADMIN ---');
    log('ID: ' + (admin?._id || 'NONE'));
    log('Email: ' + (admin?.email || 'NONE'));

    const students = await Student.find().lean();
    log('\n--- STUDENTS (' + students.length + ') ---');
    students.forEach(s => {
      log(`ID: ${s._id}, Name: ${s.name}, adminId: ${s.adminId}, createdAt: ${s.createdAt}`);
    });

    const fees = await Fee.find().lean();
    log('\n--- FEES (' + fees.length + ') ---');
    fees.forEach(f => {
      log(`ID: ${f._id}, studentId: ${f.studentId}, adminId: ${f.adminId}, amount: ${f.amount}, createdAt: ${f.createdAt}`);
    });

    log('\nDiag finished.');
    process.exit(0);
  } catch (err) {
    fs.appendFileSync(logFile, 'ERROR: ' + err.message + '\n' + err.stack);
    process.exit(1);
  }
}

diag();
