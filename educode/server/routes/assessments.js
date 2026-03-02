const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/assessments
router.get('/', protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({ isPublic: true })
      .populate('course', 'title category')
      .populate('questions', 'title type difficulty marks')
      .select('-submissions');
    const withStatus = assessments.map(a => {
      const sub = a.submissions?.find(s => s.student.toString() === req.user._id.toString());
      return { ...a.toObject(), userSubmission: sub || null };
    });
    res.json({ success: true, assessments: withStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/assessments/:id - Get assessment (with questions)
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('questions', req.user.role === 'admin' ? '' : '-correctAnswer -testCases')
      .populate('course', 'title');
    if (!assessment) return res.status(404).json({ success: false, message: 'Not found' });
    const sub = assessment.submissions.find(s => s.student.toString() === req.user._id.toString());
    res.json({ success: true, assessment: { ...assessment.toObject(), submissions: undefined }, userSubmission: sub || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/assessments - Create (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const questions = await Question.find({ _id: { $in: req.body.questions } });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const assessment = await Assessment.create({ ...req.body, totalMarks, createdBy: req.user._id });
    res.status(201).json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/assessments/:id (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/assessments/:id/submit - Submit assessment
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('questions');
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    const alreadySubmitted = assessment.submissions.find(s => s.student.toString() === req.user._id.toString());
    if (alreadySubmitted) return res.status(400).json({ success: false, message: 'Already submitted' });

    const { answers, timeTaken } = req.body;
    let score = 0;
    const processedAnswers = answers.map(ans => {
      const question = assessment.questions.find(q => q._id.toString() === ans.questionId);
      let isCorrect = false;
      let marksAwarded = 0;
      if (question?.type === 'mcq' && ans.selectedOption === question.correctAnswer) {
        isCorrect = true;
        marksAwarded = question.marks;
        score += question.marks;
      }
      return { ...ans, isCorrect, marksAwarded };
    });

    const percentage = Math.round((score / assessment.totalMarks) * 100);
    assessment.submissions.push({ student: req.user._id, answers: processedAnswers, score, totalMarks: assessment.totalMarks, percentage, timeTaken, status: 'submitted' });
    await assessment.save();

    const user = await User.findById(req.user._id);
    user.totalScore += score;
    await user.save();

    res.json({ success: true, score, totalMarks: assessment.totalMarks, percentage, passed: percentage >= assessment.passingScore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/assessments/:id/results (admin)
router.get('/:id/results', protect, authorize('admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('submissions.student', 'name email college');
    res.json({ success: true, submissions: assessment.submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
