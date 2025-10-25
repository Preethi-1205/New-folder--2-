const Group = require('../models/Group');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      created_by: req.userId
    });

    res.status(201).json({ message: 'Group created', group });
  } catch (error) {
    next(error);
  }
};

exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.getAll();
    res.json({ groups });
  } catch (error) {
    next(error);
  }
};

exports.getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ group });
  } catch (error) {
    next(error);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.update(req.params.id, { name, description });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group updated', group });
  } catch (error) {
    next(error);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    await Group.delete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    await Group.addMember(req.params.id, user_id);
    res.json({ message: 'Member added to group' });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    await Group.removeMember(req.params.id, user_id);
    res.json({ message: 'Member removed from group' });
  } catch (error) {
    next(error);
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const members = await Group.getMembers(req.params.id);
    res.json({ members });
  } catch (error) {
    next(error);
  }
};
