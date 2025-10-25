const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const groupValidation = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('description').optional().trim(),
];

const assignmentValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('due_date').isISO8601().withMessage('Valid due date is required'),
  body('total_marks').optional().isInt({ min: 0 }).withMessage('Total marks must be positive'),
  body('group_id').isUUID().withMessage('Valid group ID is required'),
];

const submissionValidation = [
  body('assignment_id').isUUID().withMessage('Valid assignment ID is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('file_url').optional().isURL().withMessage('Valid file URL required'),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  groupValidation,
  assignmentValidation,
  submissionValidation
};
