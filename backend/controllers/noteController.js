const Note = require('../models/Note');
const Student = require('../models/Student');
const { sendWhatsappText } = require('../services/whatsapp.service');
const { sendEmailNotification } = require('../services/email.service');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const https = require('https');
const { getPresignedUrl } = require('../config/s3');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.downloadNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ msg: "Note not found" });

    // 1. Handle Local Files (New Unified Pattern)
    if (note.fileUrl && !note.fileUrl.includes("cloudinary.com")) {
      const fullPath = path.join(process.cwd(), note.fileUrl);
      if (fs.existsSync(fullPath)) {
        return res.download(fullPath, note.fileName || "note.pdf");
      }
    }

    // 2. Handle S3 Files (Presigned URL Redirect)
    if (note.fileUrl && (note.fileUrl.includes("amazonaws.com") || note.public_id?.startsWith('crm/'))) {
      console.log('--- GENERATING S3 PRESIGNED URL ---');
      // If it's a full URL, extract the key, otherwise use public_id as key
      const key = note.public_id || (note.fileUrl.includes('.amazonaws.com/') ? note.fileUrl.split('.amazonaws.com/')[1] : note.fileUrl);
      const presignedUrl = await getPresignedUrl(key);
      if (presignedUrl) {
          console.log('SUCCESS: S3 Presigned URL generated');
          return res.redirect(presignedUrl);
      }
    }

    // 3. Handle Cloudinary Files (Legacy Super-Proxy Pattern)
    if (note.fileUrl && note.fileUrl.includes("cloudinary.com")) {
        console.log('--- STARTING CLOUDINARY SUPER-PROXY FETCH ---');
        let buffer;
        
        // Extract potential IDs
        const urlPId = note.fileUrl ? note.fileUrl.split('/').pop().split('?')[0] : null;
        const basePId = note.public_id || urlPId;
        const pIdVariants = [basePId, basePId.split('.')[0], encodeURIComponent(basePId)];

        // Strategy A: Authenticated API Fetch
        for (const pid of pIdVariants) {
          if (buffer) break;
          for (const resType of ['raw', 'image']) {
            if (buffer) break;
            try {
              console.log(`Trying API Strategy: id=${pid}, type=${resType}`);
              const resource = await cloudinary.api.resource(pid, { resource_type: resType });
              if (resource && resource.secure_url) {
                console.log(`Found resource: ${resource.secure_url}. Fetching...`);
                const response = await axios({
                  url: resource.secure_url,
                  method: 'GET',
                  responseType: 'arraybuffer',
                  timeout: 10000,
                  headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (response.status === 200) {
                  buffer = Buffer.from(response.data);
                  console.log('SUCCESS: Resource downloaded via API Strategy');
                }
              }
            } catch (e) {
              // Silent fail for variants
            }
          }
        }

        // Strategy B: Direct URL Fetch (Axios follows redirects)
        if (!buffer && note.fileUrl) {
          try {
            console.log(`Trying Direct URL Strategy: ${note.fileUrl}`);
            const response = await axios({
              url: note.fileUrl,
              method: 'GET',
              responseType: 'arraybuffer',
              timeout: 15000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (response.status === 200) {
              buffer = Buffer.from(response.data);
              console.log('SUCCESS: Resource downloaded via Direct Strategy');
            }
          } catch (e) {
            console.error('Direct Strategy failed:', error.message);
          }
        }

        if (buffer && buffer.length > 500) {
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${(note.fileName || 'note.pdf').replace(/["\\]/g, '')}"`,
            'Content-Length': buffer.length
          });
          return res.send(buffer);
        }
    }

    return res.status(502).json({ msg: "Failed to retrieve file from storage." });
  } catch (error) {
    console.error("Download Error:", error);
    if (!res.headersSent) res.status(500).json({ msg: "Internal server error" });
  }
};

exports.uploadNote = async (req, res) => {
  try {
    console.log('--- NEW NOTE UPLOAD REQUEST (S3) ---');
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const { title, assignedTo, course, batch, assignedStudents, sendWhatsApp, sendEmail } = req.body;
    
    // multer-s3 provides 'location' for URL and 'key' for the S3 key
    const fileUrl = req.file.location;
    const public_id = req.file.key;

    let parsedStudents = [];
    if (assignedTo === 'student' && assignedStudents) {
      try {
        parsedStudents = typeof assignedStudents === 'string' ? JSON.parse(assignedStudents) : assignedStudents;
      } catch (e) {
        console.error('Error parsing assignedStudents:', e.message);
      }
    }

    const newNote = new Note({
      title,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      public_id: req.file.filename,
      assignedTo: assignedTo || 'all',
      course: course || '',
      batch: batch || '',
      assignedStudents: parsedStudents,
      adminId: req.user.id
    });

    await newNote.save();
    console.log('Note saved locally:', newNote._id);

    // Trigger Notifications
    try {
      const shouldSendWhatsApp = sendWhatsApp === 'true' || sendWhatsApp === true;
      const shouldSendEmail = sendEmail === 'true' || sendEmail === true;

      if (shouldSendWhatsApp || shouldSendEmail) {
        let query = { isActive: true, adminId: req.user.id };
        if (assignedTo === 'course') query.course = course;
        else if (assignedTo === 'batch') query.batch = batch;
        else if (assignedTo === 'student') query._id = { $in: newNote.assignedStudents };

        const students = await Student.find(query).select('phone email name');
        const message = `Hello! A new note "${title}" has been uploaded. Check it in your portal!`;
        
        for (const student of students) {
          if (shouldSendWhatsApp && student.phone) {
            sendWhatsappText(student.phone, message).catch(err => console.error('WA Error:', err.message));
          }
          if (shouldSendEmail && student.email) {
            sendEmailNotification(student.email, `New Note: ${title}`, message).catch(err => console.error('Email Error:', err.message));
          }
        }
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message);
    }

    res.status(201).json({ msg: 'Note uploaded successfully', note: newNote });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ msg: 'Error uploading note', error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ adminId: req.user.id }).sort({ uploadDate: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ msg: 'Error fetching notes', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findOneAndDelete({ _id: noteId, adminId: req.user.id });
    res.json({ msg: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ msg: 'Error deleting note', error: error.message });
  }
};

exports.getStudentNotes = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    const notes = await Note.find({
      adminId: student.adminId, // Scope by student's admin
      $or: [
        { assignedTo: 'all' },
        { assignedTo: 'course', course: student.course },
        { assignedTo: 'batch', batch: student.batch },
        { assignedTo: 'student', assignedStudents: studentId }
      ]
    }).sort({ uploadDate: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Fetch student notes error:', error);
    res.status(500).json({ msg: 'Error fetching notes', error: error.message });
  }
};
