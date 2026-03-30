const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

async function diag() {
  dotenv.config({ path: path.join(__dirname, '.env') });
  await mongoose.connect(process.env.MONGO_URI);

  const Student = require('./models/Student');
  const Fee = require('./models/Fee');
  const Admin = require('./models/Admin');

  const admin = await Admin.findOne();
  console.log('--- ADMIN ---');
  console.log('ID:', admin?._id);
  console.log('Email:', admin?.email);

  const students = await Student.find().lean();
  console.log('\n--- STUDENTS (' + students.length + ') ---');
  students.forEach(s => {
    console.log(`ID: ${s._id}, Name: ${s.name}, adminId: ${s.adminId}, createdAt: ${s.createdAt}`);
  });

  const fees = await Fee.find().lean();
  console.log('\n--- FEES (' + fees.length + ') ---');
  fees.forEach(f => {
    console.log(`ID: ${f._id}, studentId: ${f.studentId}, adminId: ${f.adminId}, amount: ${f.amount}, createdAt: ${f.createdAt}`);
  });

  process.exit(0);
}

diag();
