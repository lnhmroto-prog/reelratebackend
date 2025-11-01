const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

const validateReview = [
  body('movieId')
    .notEmpty().withMessage('Movie ID is required')
    .isInt({ min: 1 }).withMessage('Movie ID must be a positive integer'),
  
  body('movieTitle')
    .notEmpty().withMessage('Movie title is required')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Movie title must be 1-200 characters')
    .escape(),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .notEmpty().withMessage('Comment is required')
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters')
    .escape(),
  
  handleValidationErrors
];

const validateReviewUpdate = [
  param('id')
    .notEmpty().withMessage('Review ID is required')
    .isInt({ min: 1 }).withMessage('Review ID must be a positive integer'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters')
    .escape(),
  
  handleValidationErrors
];

const validateSearch = [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be 1-100 characters')
    .escape(),
  
  query('page')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Page must be between 1 and 500'),
  
  handleValidationErrors
];

const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  
  handleValidationErrors
];

const validateMovieId = [
  param('id')
    .notEmpty().withMessage('Movie ID is required')
    .isInt({ min: 1 }).withMessage('Movie ID must be a positive integer'),
  
  handleValidationErrors
];

const validateUserProfile = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .escape(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must be no more than 500 characters')
    .escape(),
  
  handleValidationErrors
];

module.exports = {
  validateReview,
  validateReviewUpdate,
  validateSearch,
  validatePagination,
  validateMovieId,
  validateUserProfile,
  handleValidationErrors
};
