const PDFDocument = require('pdfkit');

exports.createCertificatePdfBuffer = async (cert) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // --- Simple Certificate Layout, you can customize as you prefer:

    doc
      .image('public/certificate-bg.png', 0, 0, { width: 595, height: 842 }) 
      .fontSize(30).font('Helvetica-Bold')
      .fillColor('#0e4a84').text('Certificate of Completion', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(20).fillColor('#000').text(
        `This is to certify that`, { align: 'center' })
      .moveDown();
    doc
      .fontSize(26)
      .fillColor('#1d9900')
      .text(cert.studentId.name, { align: 'center', underline: true })
      .moveDown();
    doc
      .fontSize(20).fillColor('#000').text(
        `has successfully completed the course`, { align: 'center' })
      .moveDown();
    doc
      .fontSize(24)
      .fillColor('#e99122')
      .text(cert.course, { align: 'center', underline: true })
      .moveDown(2);

    if (cert.grade)
      doc
        .fontSize(18).fillColor('#000')
        .text(`Grade: ${cert.grade}`, { align: 'center' })
        .moveDown();

    if (cert.remarks)
      doc
        .moveDown()
        .fontSize(14).fillColor('#444').text(`Remarks: ${cert.remarks}`, { align: 'center' });

    doc
      .moveDown(3)
      .fontSize(12).fillColor('#999')
      .text(`Certificate No: ${cert.certificateNumber}`, { align: 'left' })
      .text(`Date: ${cert.issueDate.toDateString()}`, { align: 'left' });

    // Add signature/image etc as needed

    doc.end(); // finalize PDF

  });
};
