const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  verifyToken,
  getUserProgress,
  updateUserProgress,
  checkPhasePurchase,
  getUserPurchases
} = require('../controllers/userController');

// Verify token
router.get('/verify', verifyToken);

// Get user progress (protected)
router.get('/:userId/progress', authenticateToken, getUserProgress);

// Update user progress (protected)
router.post('/:userId/progress', authenticateToken, updateUserProgress);

// Check if user has purchased a phase (protected)
router.get('/:userId/purchases/:phaseId', authenticateToken, checkPhasePurchase);

// Get user purchases (protected)
router.get('/:userId/purchases', authenticateToken, getUserPurchases);

module.exports = router; 