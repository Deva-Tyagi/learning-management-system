// controllers/studyMaterialController.js
const StudyMaterial = require('../models/StudyMaterial');
const Subject       = require('../models/Subject');
const { getPresignedUrl } = require('../config/s3');

// GET all materials (with optional filters)
exports.getMaterials = async (req, res) => {
  try {
    const filter = { adminId: req.user.id };
    if (req.query.subject)      filter.subjectId    = req.query.subject;
    if (req.query.materialType) filter.materialType = req.query.materialType;

    const materials = await StudyMaterial.find(filter)
      .populate('subjectId', 'name code category')
      .sort({ createdAt: -1 });

    // Sign S3 URLs
    const signed = await Promise.all(materials.map(async (m) => {
      const obj = m.toObject();
      if (obj.fileUrl) {
        try { obj.fileUrl = await getPresignedUrl(obj.fileUrl); } catch { /* keep raw URL */ }
      }
      return obj;
    }));

    res.json(signed);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching study materials', error: err.message });
  }
};

// POST upload material
exports.addMaterial = async (req, res) => {
  try {
    const { title, subjectId, materialType } = req.body;
    if (!title?.trim())   return res.status(400).json({ msg: 'Title is required' });
    if (!subjectId)       return res.status(400).json({ msg: 'Subject is required' });
    if (!req.file)        return res.status(400).json({ msg: 'File upload is required' });

    // Verify subject belongs to this admin
    const subject = await Subject.findOne({ _id: subjectId, adminId: req.user.id });
    if (!subject) return res.status(404).json({ msg: 'Subject not found' });

    // Count existing versions for same title + subject
    const existing = await StudyMaterial.findOne({ title: title.trim(), subjectId, adminId: req.user.id });
    const version  = existing ? existing.version + 1 : 1;

    const material = await StudyMaterial.create({
      title:        title.trim(),
      subjectId,
      materialType: materialType || 'Theoretical',
      fileUrl:      req.file.location || req.file.key || req.file.path,
      fileName:     req.file.originalname,
      fileSize:     req.file.size,
      mimeType:     req.file.mimetype,
      version,
      adminId:      req.user.id,
    });

    const populated = await StudyMaterial.findById(material._id).populate('subjectId', 'name code category');
    res.status(201).json({ msg: 'Study material uploaded successfully', material: populated });
  } catch (err) {
    res.status(500).json({ msg: 'Error uploading study material', error: err.message });
  }
};

// DELETE material
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findOneAndDelete({ _id: req.params.id, adminId: req.user.id });
    if (!material) return res.status(404).json({ msg: 'Study material not found' });
    res.json({ msg: 'Study material deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting study material', error: err.message });
  }
};

// GET materials for a student (by their enrolled course subjects)
exports.getMaterialsForStudent = async (req, res) => {
  try {
    const { subjectIds } = req.query; // comma-separated subject IDs
    if (!subjectIds) return res.json([]);
    const ids = subjectIds.split(',').filter(Boolean);
    const materials = await StudyMaterial.find({ subjectId: { $in: ids } })
      .populate('subjectId', 'name code')
      .sort({ subjectId: 1, createdAt: -1 });

    const signed = await Promise.all(materials.map(async (m) => {
      const obj = m.toObject();
      if (obj.fileUrl) {
        try { obj.fileUrl = await getPresignedUrl(obj.fileUrl); } catch { /* keep raw */ }
      }
      return obj;
    }));
    res.json(signed);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching student materials', error: err.message });
  }
};
