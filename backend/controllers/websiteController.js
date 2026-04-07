const ClientWebsite = require('../models/ClientWebsite');
const WebsiteQuery = require('../models/WebsiteQuery');
const Course = require('../models/Course');
const Admin = require('../models/Admin');
const { getPresignedUrl } = require('../config/s3');

const JSON_FIELDS = ['theme', 'footer', 'homePage', 'aboutPage', 'contactPage', 'coursesPage'];

// Helper: Parse any fields that got accidentally stored as JSON strings in MongoDB
const cleanDocument = (obj) => {
  if (!obj) return obj;
  JSON_FIELDS.forEach(field => {
    if (obj[field] && typeof obj[field] === 'string') {
      try { obj[field] = JSON.parse(obj[field]); } catch (e) {
        console.warn(`[cleanDocument] Could not parse field "${field}", clearing it.`);
        obj[field] = {};
      }
    }
  });
  return obj;
};

// Helper: Refresh the logoUrl with a presigned URL if it's an S3 URL
const freshenLogoUrl = async (obj) => {
  if (!obj) return obj;
  // Works with plain objects (.lean()) or Mongoose docs (.toObject())
  const plain = obj.toObject ? obj.toObject() : obj;
  cleanDocument(plain);
  if (plain.theme?.logoUrl && plain.theme.logoUrl.includes('amazonaws.com')) {
    const fresh = await getPresignedUrl(plain.theme.logoUrl);
    if (fresh) plain.theme.logoUrl = fresh;
  }
  return plain;
};

// --- PUBLIC ROUTES (For the Storefront UI) ---

// Resolve a website by its custom domainName string
exports.resolveWebsite = async (req, res) => {
  try {
    const { domainName } = req.params;
    // Use $ne: false so both boolean true AND string "true" storefronts are found
    const website = await ClientWebsite.findOne({ domainName, isActive: { $ne: false } })
      .populate('adminId', 'instituteName email phone')
      .lean();
    
    if (!website) {
      return res.status(404).json({ success: false, message: 'Website not found' });
    }
    
    const freshWebsite = await freshenLogoUrl(website);
    res.json({ success: true, website: freshWebsite });
  } catch (error) {
    console.error('Error resolving website:', error);
    res.status(500).json({ success: false, message: 'Server error resolving website' });
  }
};


// Get all public courses for the specific admin/client
exports.getWebsiteCourses = async (req, res) => {
  try {
    const { adminId } = req.params;
    const courses = await Course.find({ adminId, isActive: { $ne: false } })
      .select('name image shortDescription duration durationMonths totalFee fees monthlyFee category level isActive')
      .sort({ order: 1 })
      .lean();

    // Presign S3 image URLs so the frontend can display them
    const signed = await Promise.all(courses.map(async (c) => {
      if (c.image && c.image.includes('amazonaws.com')) {
        const fresh = await getPresignedUrl(c.image);
        if (fresh) c.image = fresh;
      }
      return c;
    }));

    res.json({ success: true, courses: signed });
  } catch (error) {
    console.error('Error fetching website courses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching courses' });
  }
};

// Get a single course by ID (for course detail page)
exports.getSingleCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Presign the course image if it's an S3 URL
    if (course.image && course.image.includes('amazonaws.com')) {
      const fresh = await getPresignedUrl(course.image);
      if (fresh) course.image = fresh;
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error('Error fetching single course:', error);
    res.status(500).json({ success: false, message: 'Server error fetching course' });
  }
};


// Submit a contact form query
exports.submitQuery = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    const query = new WebsiteQuery({
      adminId,
      name,
      email,
      phone,
      subject,
      message
    });
    
    await query.save();
    res.status(201).json({ success: true, message: 'Query submitted successfully' });
  } catch (error) {
    console.error('Error submitting query:', error);
    res.status(500).json({ success: false, message: 'Server error submitting query' });
  }
};


// --- ADMIN ROUTES (For the specific Institute Owner) ---

// Get all queries submitted to this specific admin
exports.getAdminQueries = async (req, res) => {
  try {
    const adminId = req.user.id; // From authMiddleware
    const queries = await WebsiteQuery.find({ adminId }).sort({ createdAt: -1 });
    res.json({ success: true, queries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching queries' });
  }
};

// Update query status
exports.updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    const query = await WebsiteQuery.findOneAndUpdate(
      { _id: id, adminId },
      { status },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    res.json({ success: true, query });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating query' });
  }
};


// --- SUPERADMIN ROUTES (To manage all white-label sites) ---

exports.getAllWebsites = async (req, res) => {
  try {
    const websites = await ClientWebsite.find().populate('adminId', 'name instituteName email').lean();
    res.json({ success: true, websites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching websites' });
  }
};

exports.getWebsiteByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    // .lean() skips Mongoose hydration — safe even if DB has stringified JSON fields
    const website = await ClientWebsite.findOne({ adminId }).lean();
    const freshWebsite = await freshenLogoUrl(website);
    res.json({ success: true, website: freshWebsite });
  } catch (error) {
    console.error('Error fetching website config:', error);
    res.status(500).json({ success: false, message: 'Error fetching website config' });
  }
};

exports.createOrUpdateWebsite = async (req, res) => {
  try {
    const { adminId } = req.params;
    let data = { ...req.body };

    // Parse all JSON-stringified FormData fields
    JSON_FIELDS.forEach(field => {
      if (data[field] && typeof data[field] === 'string') {
        try { data[field] = JSON.parse(data[field]); }
        catch (e) { console.error(`Failed to parse field "${field}":`, e.message); }
      }
    });

    // Capture uploaded logo S3 URL from multer
    if (req.file) {
      const logoUrl = req.file.location || `/uploads/${req.file.filename}`;
      data.theme = data.theme || {};
      data.theme.logoUrl = logoUrl;
    }

    // Check if domainName is taken by ANOTHER admin
    if (data.domainName) {
      const existingDomain = await ClientWebsite.findOne({ domainName: data.domainName, adminId: { $ne: adminId } }).lean();
      if (existingDomain) {
        return res.status(400).json({ success: false, message: 'Domain name is already mapped to another client.' });
      }
    }

    const existing = await ClientWebsite.findOne({ adminId }).lean();

    if (existing) {
      // Cast primitive fields correctly before raw MongoDB update
      if (data.isActive !== undefined) data.isActive = data.isActive === 'true' || data.isActive === true;
      if (data.domainName) data.domainName = data.domainName.toLowerCase().trim();

      // Use raw collection update — bypasses Mongoose hydration on stale/corrupt doc
      await ClientWebsite.collection.updateOne(
        { adminId: require('mongoose').Types.ObjectId.createFromHexString(adminId) },
        { $set: data }
      );
      const updated = await ClientWebsite.findOne({ adminId }).lean();
      res.json({ success: true, website: updated, message: 'Website config updated' });
    } else {
      const website = new ClientWebsite({ ...data, adminId });
      const saved = await website.save();
      res.status(201).json({ success: true, website: saved.toObject(), message: 'Website config created' });
    }
  } catch (error) {
    console.error('Error saving website config:', error);
    res.status(500).json({ success: false, message: 'Error saving website config' });
  }
};
