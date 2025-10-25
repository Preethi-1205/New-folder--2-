const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { auth, adminAuth } = require('../middleware/auth');
const { validate, assignmentValidation } = require('../middleware/validation');

router.post('/', auth, adminAuth, validate(assignmentValidation), assignmentController.createAssignment);
router.get('/', auth, assignmentController.getAllAssignments);
router.get('/:id', auth, assignmentController.getAssignmentById);
router.put('/:id', auth, adminAuth, assignmentController.updateAssignment);
router.delete('/:id', auth, adminAuth, assignmentController.deleteAssignment);

module.exports = router;
