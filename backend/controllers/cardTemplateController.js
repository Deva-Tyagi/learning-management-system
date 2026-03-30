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
