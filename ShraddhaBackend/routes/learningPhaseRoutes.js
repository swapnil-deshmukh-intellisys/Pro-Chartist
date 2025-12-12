const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getAllLearningPhases,
  getLearningPhaseById,
  createOrUpdateLearningPhase,
  updateLearningPhase,
  deleteLearningPhase,
  bulkUpdateLearningPhases,
  addContentToPhase,
  updateContentInPhase,
  deleteContentFromPhase
} = require('../controllers/learningPhaseController');
const { imageStorage } = require('../config/cloudinary');
const upload = multer({ storage: imageStorage });

// GET all learning phases
router.get('/', getAllLearningPhases);

// GET learning phase by ID
router.get('/:phaseId', getLearningPhaseById);

// POST create or update learning phase
router.post('/', createOrUpdateLearningPhase);

// PUT update learning phase
router.put('/:phaseId', updateLearningPhase);

// DELETE learning phase (soft delete)
router.delete('/:phaseId', deleteLearningPhase);

// PUT bulk update learning phases
router.put('/bulk/update', bulkUpdateLearningPhases);

// POST add content to a learning phase
router.post('/:phaseId/content', addContentToPhase);

// PUT update content in a learning phase
router.put('/:phaseId/content/:contentId', updateContentInPhase);

// DELETE content from a learning phase
router.delete('/:phaseId/content/:contentId', deleteContentFromPhase);

module.exports = router; 