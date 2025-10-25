const Submission = require('../models/Submission');

exports.createSubmission = async (req, res, next) => {
  try {
    const { assignment_id, content, file_url } = req.body;

    // Check if already submitted
    const existing = await Submission.getByAssignmentAndUser(assignment_id, req.userId);
    if (existing) {
      return res.status(400).json({ error: 'Already submitted. Use update instead.' });
    }

    const submission = await Submission.create({
      assignment_id,
      user_id: req.userId,
      content,
      file_url
    });

    res.status(201).json({ message: 'Submission created', submission });
  } catch (error) {
    next(error);
  }
};

exports.getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.getAll(req.userId, req.user.role);
    res.json({ submissions });
  } catch (error) {
    next(error);
  }
};

exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json({ submission });
  } catch (error) {
    next(error);
  }
};

exports.updateSubmission = async (req, res, next) => {
  try {
    const { content, file_url } = req.body;
    
    const submission = await Submission.update(req.params.id, {
      content,
      file_url
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ message: 'Submission updated', submission });
  } catch (error) {
    next(error);
  }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const { marks_obtained, feedback } = req.body;
    
    const submission = await Submission.grade(req.params.id, {
      marks_obtained,
      feedback
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ message: 'Submission graded', submission });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubmission = async (req, res, next) => {
  try {
    await Submission.delete(req.params.id);
    res.json({ message: 'Submission deleted' });
  } catch (error) {
    next(error);
  }
};
