const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const Course = require('./backend/models/Course');

async function check() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in backend/.env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Course.countDocuments();
    console.log(`TOTAL_COURSES: ${count}`);
    const courses = await Course.find({}, { name: 1 });
    console.log(`COURSE_NAMES: ${JSON.stringify(courses.map(c => c.name))}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
