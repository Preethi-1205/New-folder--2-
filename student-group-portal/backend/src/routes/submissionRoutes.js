const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { auth, adminAuth } = require('../middleware/auth');
const { validate, submissionValidation } = require('../middleware/validation');

router.post('/', auth, validate(submissionValidation), submissionController.createSubmission);
router.get('/', auth, submissionController.getAllSubmissions);
router.get('/:id', auth, submissionController.getSubmissionById);
router.put('/:id', auth, submissionController.updateSubmission);
router.post('/:id/grade', auth, adminAuth, submissionController.gradeSubmission);
router.delete('/:id', auth, submissionController.deleteSubmission);

module.exports = router;
