// controllers/courseController.js
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');
const { getPresignedUrl } = require('../config/s3');

// NEW: Minimal list for SchemeSelector (admin protected)
exports.getCoursesLite = async (req, res) => {
  try {
    const courses = await Course.find(
      { isActive: true, adminId: req.user.id },
      { name: 1, monthlyFee: 1, durationMonths: 1, totalFee: 1, fees: 1, feeType: 1, defaultInstallments: 1 }
    )
      .sort({ name: 1 })
      .lean();

    const normalized = courses.map(c => {
      const duration = Number(c.durationMonths || 0);
      const baseTotal = (c.totalFee != null ? Number(c.totalFee) : 0) || Number(c.fees || 0);
      let monthly = Number(c.monthlyFee || 0);
      if (!monthly && baseTotal && duration) {
        monthly = Math.round((baseTotal / duration) * 100) / 100;
      }
      const total = baseTotal || (monthly && duration ? monthly * duration : 0);
      return {
        _id: c._id,
        name: c.name,
        monthlyFee: monthly || 0,
        durationMonths: duration || 0,
        totalFee: total || 0,
        feeType: c.feeType || 'Fixed',
        defaultInstallments: c.defaultInstallments || 3
      };
    });

    res.json(normalized);
  } catch (error) {
    console.error('getCoursesLite error:', error);
    res.status(500).json({ msg: 'Error fetching course' });
  }
};

// Get all courses (for navbar - public route)
exports.getCoursesForNavbar = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .select('name link _id category')
      .sort({ category: 1, order: 1 });

    const groupedCourses = {
      computerCourses: [],
      englishCourses: [],
      distanceLearning: []
    };

    courses.forEach(course => {
      if (groupedCourses[course.category]) {
        groupedCourses[course.category].push({
          name: course.name,
          link: course.link,
          _id: course._id
        });
      }
    });

    res.json(groupedCourses);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching courses for navbar', error: error.message });
  }
};

// Get single course by ID (public route)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.isActive) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching course', error: error.message });
  }
};

// Get all courses (for admin dashboard)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ adminId: req.user.id }).sort({ category: 1, order: 1, createdAt: -1 });
    
    // Sign URLs for S3 images
    const signedCourses = await Promise.all(courses.map(async (course) => {
      const c = course.toObject();
      if (c.image) c.image = await getPresignedUrl(c.image);
      return c;
    }));

    res.json(signedCourses);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching courses', error: error.message });
  }
};

// Add new course
exports.addCourse = async (req, res) => {
  try {
    const courseData = { ...req.body };

    // Handle image upload
    if (req.file) courseData.image = req.file.location;

    // Parse arrays safely
    const arrayFields = ['learningOutcomes', 'whyThisCourse', 'prerequisites', 'toolsUsed', 'careerOpportunities', 'curriculum', 'subjects'];
    arrayFields.forEach(field => {
      if (courseData[field] && typeof courseData[field] === 'string') {
        try {
          const parsed = JSON.parse(courseData[field]);
          if (Array.isArray(parsed)) {
            courseData[field] = field === 'curriculum'
              ? parsed.filter(it => it && typeof it === 'object' && it.module && it.module.trim() !== '')
              : parsed.filter(it => it && String(it).trim() !== '');
          } else {
            courseData[field] = [];
          }
        } catch {
          courseData[field] = [];
        }
      } else if (!courseData[field]) {
        courseData[field] = [];
      }
    });

    // Booleans
    if (typeof courseData.certificateProvided === 'string') {
      courseData.certificateProvided = courseData.certificateProvided === 'true';
    }

    // Numbers (legacy + new)
    ['fees', 'monthlyFee', 'durationMonths', 'totalFee'].forEach(k => {
      if (courseData[k] != null && typeof courseData[k] === 'string') {
        courseData[k] = parseFloat(courseData[k]) || 0;
      }
    });

    // Required validations
    if (!courseData.name || courseData.name.trim() === '') {
      return res.status(400).json({ msg: 'Course name is required' });
    }

    const existingCourse = await Course.findOne({ name: courseData.name.trim(), adminId: req.user.id });
    if (existingCourse) {
      return res.status(400).json({ msg: 'Course with this name already exists' });
    }

    courseData.adminId = req.user.id;
    const course = new Course(courseData);
    await course.save();

    const c = course.toObject();
    if (c.image) c.image = await getPresignedUrl(c.image);

    res.status(201).json({ msg: 'Course added successfully', course: c });
  } catch (error) {
    console.error('Error in addCourse:', error);
    if (error.code === 11000) {
      res.status(400).json({ msg: 'Course with this name already exists' });
    } else if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ msg: 'Validation error', errors: validationErrors });
    } else {
      res.status(500).json({ msg: 'Error adding course', error: error.message });
    }
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!courseId || courseId === 'undefined') {
      return res.status(400).json({ msg: 'Invalid Course ID provided' });
    }
    const updateData = { ...req.body };

    // Image handling
    if (req.file) {
      updateData.image = req.file.location;
      // Note: Cloudinary/S3 deletion logic for original image can be added here if needed
    }

    // Parse arrays
    const arrayFields = ['learningOutcomes', 'whyThisCourse', 'prerequisites', 'toolsUsed', 'careerOpportunities', 'curriculum', 'subjects'];
    arrayFields.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          const parsed = JSON.parse(updateData[field]);
          if (Array.isArray(parsed)) {
            updateData[field] = field === 'curriculum'
              ? parsed.filter(it => it && typeof it === 'object' && it.module && it.module.trim() !== '')
              : parsed.filter(it => it && String(it).trim() !== '');
          } else {
            updateData[field] = [];
          }
        } catch {
          delete updateData[field]; // ignore invalid field
        }
      }
    });

    // Booleans
    if (typeof updateData.certificateProvided === 'string') {
      updateData.certificateProvided = updateData.certificateProvided === 'true';
    }

    // Numbers (legacy + new)
    ['fees', 'monthlyFee', 'durationMonths', 'totalFee'].forEach(k => {
      if (updateData[k] != null && typeof updateData[k] === 'string') {
        updateData[k] = parseFloat(updateData[k]) || 0;
      }
    });

    if (updateData.name && updateData.name.trim() === '') {
      return res.status(400).json({ msg: 'Course name cannot be empty' });
    }

    // Check for duplicate name if changed
    if (updateData.name) {
      const existing = await Course.findOne({ 
        name: updateData.name.trim(), 
        adminId: req.user.id,
        _id: { $ne: courseId }
      });
      if (existing) return res.status(400).json({ msg: 'Another course already has this name' });
    }

    const course = await Course.findOneAndUpdate(
      { _id: courseId, adminId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const c = course.toObject();
    if (c.image) c.image = await getPresignedUrl(c.image);

    res.json({ msg: 'Course updated successfully', course: c });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ msg: 'Validation error', errors: validationErrors });
    } else {
      res.status(500).json({ msg: 'Error updating course', error: error.message });
    }
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!courseId) return res.status(400).json({ msg: 'Course ID is required' });

    const course = await Course.findOneAndDelete({ _id: courseId, adminId: req.user.id });
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // Note: Cloudinary deletion can be added here using course.public_id if we decide to store it

    res.json({ msg: 'Course deleted successfully', deletedCourse: course.name });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({ msg: 'Error deleting course', error: error.message });
  }
};

// Toggle course active status
exports.toggleCourseStatus = async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!courseId) return res.status(400).json({ msg: 'Course ID is required' });

    const course = await Course.findOne({ _id: courseId, adminId: req.user.id });
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    course.isActive = !course.isActive;
    await course.save();

    res.json({
      msg: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      course: { _id: course._id, name: course.name, isActive: course.isActive }
    });
  } catch (error) {
    console.error('Error in toggleCourseStatus:', error);
    res.status(500).json({ msg: 'Error updating course status', error: error.message });
  }
};

// Get courses by category (public utility)
exports.getCoursesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const valid = ['computerCourses', 'englishCourses', 'distanceLearning'];
    if (!valid.includes(category)) return res.status(400).json({ msg: 'Invalid category' });

    const courses = await Course.find({ category, isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Error in getCoursesByCategory:', error);
    res.status(500).json({ msg: 'Error fetching courses by category', error: error.message });
  }
};

// Search courses (public utility)
exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') return res.status(400).json({ msg: 'Search query is required' });

    const courses = await Course.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { shortDescription: { $regex: query, $options: 'i' } },
            { fullDescription: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Error in searchCourses:', error);
    res.status(500).json({ msg: 'Error searching courses', error: error.message });
  }
};
