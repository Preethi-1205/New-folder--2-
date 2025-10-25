const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { auth, adminAuth } = require('../middleware/auth');
const { validate, groupValidation } = require('../middleware/validation');

router.post('/', auth, adminAuth, validate(groupValidation), groupController.createGroup);
router.get('/', auth, groupController.getAllGroups);
router.get('/:id', auth, groupController.getGroupById);
router.put('/:id', auth, adminAuth, groupController.updateGroup);
router.delete('/:id', auth, adminAuth, groupController.deleteGroup);
router.post('/:id/members', auth, adminAuth, groupController.addMember);
router.delete('/:id/members', auth, adminAuth, groupController.removeMember);
router.get('/:id/members', auth, groupController.getMembers);

module.exports = router;
