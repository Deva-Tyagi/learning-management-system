const Franchise = require('../models/Franchise');
const { getPresignedUrl } = require('../config/s3');

exports.getFranchises = async (req, res) => {
  try {
    const franchises = await Franchise.find().sort({ createdAt: -1 });
    
    // Sign URLs for S3 files
    const signedFranchises = await Promise.all(franchises.map(async (f) => {
      const franchise = f.toObject();
      const fieldsToSign = ['directorPhoto', 'signature', 'centerPhoto', 'otherDocument', 'aadharCard'];
      for (const field of fieldsToSign) {
        if (franchise[field]) {
          franchise[field] = await getPresignedUrl(franchise[field]);
        }
      }
      return franchise;
    }));

    res.json(signedFranchises);
  } catch (error) {
    console.error('Fetch franchises error:', error);
    res.status(500).json({ message: 'Failed to fetch franchises', error: error.message });
  }
};

exports.addFranchise = async (req, res) => {
  try {
    const toPath = (field) => {
      if (req.files && req.files[field] && req.files[field].length > 0) {
        // Use .location for S3, fallback to .filename for local
        return req.files[field][0].location || `/uploads/${req.files[field][0].filename}`;
      }
      return req.body[field] || '';
    };

    // ✅ Quota Enforcement Check (Enterprise Branches)
    const GlobalSetting = require('../models/GlobalSetting');
    const Admin = require('../models/Admin');
    const settings = await GlobalSetting.findOne();
    const admin = await Admin.findById(req.user?.id); // req.user comes from auth middleware

    if (settings && admin) {
        const branchCount = await Franchise.countDocuments({ adminId: req.user.id });
        const limit = settings.quotas?.enterpriseBranchLimit || 10;
        
        if (branchCount >= limit) {
          return res.status(403).json({ 
            message: `Branch limit reached for your ${admin.plan} plan (${limit} branches). Please contact support to increase.`,
            limit 
          });
        }
    }

    const franchiseData = {
      ...req.body,
      regDate: req.body.regDate ? new Date(req.body.regDate) : undefined,
      directorPhoto: toPath('directorPhoto'),
      signature: toPath('signature'),
      centerPhoto: toPath('centerPhoto'),
      otherDocument: toPath('otherDocument'),
      aadharCard: toPath('aadharCard')
    };

    const existing = await Franchise.findOne({ centerCode: franchiseData.centerCode });
    if (existing) {
      return res.status(409).json({ message: 'Center code already exists' });
    }

    const franchise = new Franchise(franchiseData);
    await franchise.save();

    res.status(201).json({ message: 'Franchise created', franchise });
  } catch (error) {
    console.error('Create franchise error:', error);
    res.status(500).json({ message: 'Failed to create franchise', error: error.message });
  }
};

exports.deleteFranchise = async (req, res) => {
  try {
    const { id } = req.params;
    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res.status(404).json({ message: 'Franchise not found' });
    }
    await Franchise.findByIdAndDelete(id);
    res.json({ message: 'Franchise removed' });
  } catch (error) {
    console.error('Delete franchise error:', error);
    res.status(500).json({ message: 'Failed to delete franchise', error: error.message });
  }
};
