const Assignment = require('../models/Assignment');

exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, due_date, total_marks, group_id } = req.body;
    
    const assignment = await Assignment.create({
      title,
      description,
      due_date,
      total_marks: total_marks || 100,
      group_id,
      created_by: req.userId
    });

    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (error) {
    next(error);
  }
};

exports.getAllAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.getAll(req.userId, req.user.role);
    console.log(assignments);
    res.json({ assignments });
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ assignment });
  } catch (error) {
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const { title, description, due_date, total_marks } = req.body;
    
    const assignment = await Assignment.update(req.params.id, {
      title,
      description,
      due_date,
      total_marks
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment updated', assignment });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    await Assignment.delete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};
