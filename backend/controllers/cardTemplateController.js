const CardTemplate = require('../models/CardTemplate');
const { getPresignedUrl } = require('../config/s3');

exports.getTemplates = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { createdBy: req.user.id };
    if (type) query.type = type;
    const templates = await CardTemplate.find(query).sort({ createdAt: -1 });
    
    // Sign URLs
    const signedTemplates = await Promise.all(templates.map(async (t) => {
      const template = t.toObject();
      if (template.backgroundImage) {
        template.backgroundImage = await getPresignedUrl(template.backgroundImage);
      }
      return template;
    }));

    res.json(signedTemplates);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      type,
      orientation,
      fontSize,
      fontColor,
      fontFamily,
      templateText,
      backgroundImage,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ msg: 'Name and type are required' });
    }

    let backgroundImagePath = backgroundImage || '';
    if (req.file) {
      backgroundImagePath = req.file.location || req.file.path;
    }

    const elements = req.body.elements ? JSON.parse(req.body.elements) : [];

    const template = new CardTemplate({
      name,
      type,
      orientation,
      fontSize: Number(fontSize) || 14,
      fontColor: fontColor || '#000000',
      fontFamily: fontFamily || 'Arial',
      templateText: templateText || '',
      backgroundImage: backgroundImagePath,
      elements,
      createdBy: req.user.id,
    });

    await template.save();
    res.status(201).json({ msg: 'Template created', template });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await CardTemplate.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!template) return res.status(404).json({ msg: 'Template not found or unauthorized' });
    res.json({ msg: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.bulkIssueDocuments = async (req, res) => {
  try {
    const { studentIds, templateId, type } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ msg: 'No students selected' });
    }

    let Model;
    switch (type) {
      case 'id-card': Model = require('../models/IdCard'); break;
      case 'certificate': Model = require('../models/Certificate'); break;
      case 'admit-card': Model = require('../models/AdmitCard'); break;
      case 'marksheet': Model = require('../models/Marksheet'); break;
      default: return res.status(400).json({ msg: 'Invalid document type' });
    }

    const operations = studentIds.map(sid => ({
      studentId: sid,
      template: templateId,
      adminId,
      status: 'active',
      generatedBy: adminId, // for id-cards/admit-cards
      issuedBy: adminId, // for id-cards
      course: 'Auto' // placeholders
    }));

    // Simple loop for reliability or insertMany if schemas match
    for (const op of operations) {
      // Check for duplicates
      const dup = await Model.findOne({ studentId: op.studentId, adminId });
      if (!dup) {
        await new Model(op).save();
      }
    }

    res.json({ msg: `Bulk ${type} issuance completed successfully` });
  } catch (error) {
    res.status(500).json({ msg: 'Bulk issuance failed', error: error.message });
  }
};
