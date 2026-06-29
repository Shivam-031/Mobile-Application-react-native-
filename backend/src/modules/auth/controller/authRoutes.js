const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('./authController');
const { protect } = require('../../../middleware/authMiddleware');
const { validate } = require('../../../middleware/validateMiddleware');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  // `optional()` only skips undefined/null — an empty string from the mobile
  // form (phone is initialized as '' on the client) would still fail the
  // regex. Treat empty strings as absent so mobile's "Phone (optional)"
  // field actually behaves as optional.
  body('phone').optional({ values: 'falsy' }).matches(/^[6-9]\d{9}$/).withMessage('Valid Indian mobile number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // adminKey is optional — only checked server-side when present. No length /
  // format rules here so a wrong key doesn't fail validation before reaching
  // the comparison in authService (which surfaces a clearer 403 error).
  body('adminKey').optional({ values: 'falsy' }).isString(),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', body('email').isEmail(), validate, authController.forgotPassword);
router.post('/reset-password/:token', body('password').isLength({ min: 6 }), validate, authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
