const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

exports.createIdCardPdfBuffer = async (student, institution = {}) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: [350, 220], // ID card size (pt)
      margins: { top: 15, left: 18, right: 15, bottom: 8 }
    });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // BG color or border
    doc.rect(0, 0, 350, 220).fill('#e7effa');
    doc.fillColor('#003366');

    // Draw logo if provided
    if (institution.logoPath && fs.existsSync(institution.logoPath)) {
      doc.image(institution.logoPath, 20, 18, { width: 38 });
    }

    // Institute Name & tagline
    doc.fontSize(15).font('Helvetica-Bold').fillColor('#003366')
      .text(institution.name || 'Your Institute', 67, 20, { align: 'left' });
    doc.fontSize(9).font('Helvetica').fillColor('#444')
      .text(institution.tagline || "Student Identity Card", 67, 41);

    // ======== Photo (left side) handling ========
    let photoBuffer = null;
    if (student.photo) {
      if (student.photo.startsWith('http')) {
        try {
          const response = await axios.get(student.photo, { responseType: 'arraybuffer' });
          photoBuffer = Buffer.from(response.data);
        } catch (e) {
          console.error("Error fetching S3 photo for PDF:", e.message);
        }
      } else {
        // Local path logic
        let relativePhoto = student.photo.replace(/^\/?uploads\//, '').replace(/^\//, '');
        let tryPaths = [
          path.join(process.cwd(), 'uploads', relativePhoto),
          path.join(process.cwd(), 'public', 'uploads', relativePhoto)
        ];
        let foundPath = tryPaths.find(p => fs.existsSync(p));
        if (foundPath) photoBuffer = foundPath;
      }
    }

    if (photoBuffer) {
      doc.image(photoBuffer, 20, 60, { width: 60, height: 76 });
    } else {
      doc.rect(20, 60, 60, 76).stroke();
      doc.fontSize(8).fillColor('#999').text('No Photo', 32, 95, { width: 40 });
    }

    // Info fields (right of photo)
    const infoLeft = 88;
    let y = 60;
    const row = (label, value) => {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#222').text(label, infoLeft, y, { continued: true })
        .font('Helvetica').fillColor('#111').text(String(value ?? "-"), infoLeft + 48, y);
      y += 14;
    };

    row('Name:', student.name);
    row('Roll No:', student.rollNumber);
    row('Course:', student.course);
    row('Batch:', student.batch);
    row('DOB:', student.dob ? new Date(student.dob).toLocaleDateString() : '-');
    row('Year:', student.admissionYear ?? (student.admissionDate ? new Date(student.admissionDate).getFullYear() : '-'));

    // Unique QR code (bottom left)
    const qrLink = institution.verifyUrl
      ? `${institution.verifyUrl}?id=${student._id}`
      : `https://your-domain.com/verify-id/${student._id}`;
    const qrDataUrl = await QRCode.toDataURL(qrLink, { margin: 0, width: 66 });
    doc.image(Buffer.from(qrDataUrl.split(',')[1], 'base64'), 19, 146, { width: 39 });

    doc.fontSize(7).fillColor('#444')
      .text('Scan to verify', 18, 188, { width: 40, align: 'center' });

    // Validity & Issue
    doc.fontSize(8).fillColor('#222').text(
      `Issued: ${new Date().toLocaleDateString()}`, 85, 156
    );
    doc.text('Valid for current session', 85, 168);

    // Footer/institute contact
    doc.fontSize(7).fillColor('#2776b3')
      .text(institution.address || 'www.myinstitute.com • info@myinstitute.com', 15, 206, { align: 'center' });

    doc.end();
  });
};
