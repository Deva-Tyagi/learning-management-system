const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const Admin = require('./backend/models/Admin');
const Student = require('./backend/models/Student');
const Course = require('./backend/models/Course');
const Fee = require('./backend/models/Fee');
const Exam = require('./backend/models/Exam');
const Attendance = require('./backend/models/Attendance');
const Note = require('./backend/models/Note');
const Certificate = require('./backend/models/Certificate');
const LiveClass = require('./backend/models/LiveClass');

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 20000 // 20s timeout
        });
        console.log('Connected to MongoDB successfully');

        // 1. Find Primary Admin
        let primaryAdmin = await Admin.findOne({ email: /devadixit|devatyagi/ });
        if (!primaryAdmin) {
            primaryAdmin = await Admin.findOne({});
        }
        if (!primaryAdmin) {
            console.error('No admin found to associate data with!');
            process.exit(1);
        }
        const adminId = primaryAdmin._id;
        console.log(`Using Admin ID: ${adminId} (${primaryAdmin.email}) as primary.`);

        // 2. Sanitize Admins
        console.log('Sanitizing Admin records...');
        const admins = await Admin.find({});
        for (const admin of admins) {
            let updated = false;
            if (admin.email === 'devatyagi2000@gmail.com' || admin.email === 'devadixit1999@gmail.com') {
                if (admin.isTemporaryPassword) {
                    admin.isTemporaryPassword = false;
                    updated = true;
                }
            }
            if (!admin.mobile) { admin.mobile = '0000000000'; updated = true; }
            if (!admin.instituteName) { admin.instituteName = 'Default Institute'; updated = true; }
            if (!admin.field) { admin.field = 'Education'; updated = true; }
            
            if (updated) {
                console.log(`Updating admin: ${admin.email}`);
                await Admin.findOneAndUpdate(
                    { _id: admin._id },
                    { 
                        isTemporaryPassword: admin.isTemporaryPassword,
                        mobile: admin.mobile,
                        instituteName: admin.instituteName,
                        field: admin.field
                    },
                    { runValidators: false }
                );
            }
        }

        // 3. Migrate Records
        const models = [
            { name: 'Student', model: Student },
            { name: 'Course', model: Course },
            { name: 'Fee', model: Fee },
            { name: 'Exam', model: Exam },
            { name: 'Attendance', model: Attendance },
            { name: 'Note', model: Note },
            { name: 'Certificate', model: Certificate },
            { name: 'LiveClass', model: LiveClass }
        ];

        for (const { name, model } of models) {
            console.log(`Migrating ${name} records...`);
            const result = await model.updateMany(
                { adminId: { $exists: false } },
                { $set: { adminId: adminId } }
            );
            console.log(`Updated ${result.modifiedCount} ${name} records.`);
        }

        console.log('MIGRATION COMPLETE!');
        process.exit(0);
    } catch (err) {
        console.error('MIGRATION ERROR:', err);
        process.exit(1);
    }
}

run();
