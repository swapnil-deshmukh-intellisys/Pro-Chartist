const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentDetails, getUserPayments } = require('../controllers/paymentController');

// Create payment order
router.post('/create-order', createOrder);

// Verify payment signature
router.post('/verify-payment', verifyPayment);

// Get payment details
router.get('/payment/:paymentId', getPaymentDetails);

// Get user payments
router.get('/user/:userId', getUserPayments);

module.exports = router; 