const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');
const {
  getMaterials, addMaterial, deleteMaterial, getMaterialsForStudent,
} = require('../controllers/studyMaterialController');

// Admin routes
router.get('/',                  auth, getMaterials);
router.post('/upload',           auth, upload.single('file'), addMaterial);
router.delete('/:id',            auth, deleteMaterial);

// Student-facing route (returns materials for given subject IDs)
router.get('/student',           auth, getMaterialsForStudent);

module.exports = router;
