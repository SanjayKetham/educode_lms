const express = require('express');
const router = express.Router();
const CollegeTest = require('../models/CollegeTest');
const Question = require('../models/Question');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/tests
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.status = { $in: ['scheduled', 'live'] };
    const tests = await CollegeTest.find(filter)
      .populate('mcqQuestions', 'title difficulty')
      .populate('codingQuestions', 'title difficulty')
      .select('-submissions');
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/tests - Create test (admin/college)
router.post('/', protect, authorize('admin', 'college'), async (req, res) => {
  try {
    const test = await CollegeTest.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/tests/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const test = await CollegeTest.findById(req.params.id)
      .populate('mcqQuestions', req.user.role === 'student' ? '-correctAnswer' : '')
      .populate('codingQuestions', req.user.role === 'student' ? '-testCases' : '');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/tests/join - Join test by test code
router.post('/join', protect, async (req, res) => {
  try {
    const { testCode } = req.body;
    const test = await CollegeTest.findOne({ testCode });
    if (!test) return res.status(404).json({ success: false, message: 'Invalid test code' });
    if (test.status === 'completed') return res.status(400).json({ success: false, message: 'Test has ended' });
    if (!test.registeredStudents.includes(req.user._id)) {
      test.registeredStudents.push(req.user._id);
      await test.save();
    }
    res.json({ success: true, test: { _id: test._id, title: test.title, college: test.college, startTime: test.startTime, duration: test.duration, status: test.status } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/tests/:id/status (admin/college)
router.put('/:id/status', protect, authorize('admin', 'college'), async (req, res) => {
  try {
    const test = await CollegeTest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/tests/:id/submit
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const test = await CollegeTest.findById(req.params.id).populate('mcqQuestions codingQuestions');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    const already = test.submissions.find(s => s.student.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'Already submitted' });

    const { mcqAnswers, codingAnswers, timeTaken } = req.body;
    let totalScore = 0;

    const processedMCQ = (mcqAnswers || []).map(ans => {
      const q = test.mcqQuestions.find(q => q._id.toString() === ans.questionId);
      const isCorrect = q && ans.selectedOption === q.correctAnswer;
      const marks = isCorrect ? (q?.marks || 2) : 0;
      totalScore += marks;
      return { ...ans, isCorrect, marks };
    });

    const processedCoding = (codingAnswers || []).map(ans => {
      const marks = Math.round((ans.passed / ans.total) * 10);
      totalScore += marks;
      return { ...ans, marks };
    });

    const totalPossible = test.mcqQuestions.reduce((s, q) => s + q.marks, 0) + test.codingQuestions.length * 10;
    const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

    test.submissions.push({ student: req.user._id, mcqAnswers: processedMCQ, codingAnswers: processedCoding, totalScore, percentage, timeTaken, status: 'submitted' });

    // Update ranks
    test.submissions.sort((a, b) => b.totalScore - a.totalScore);
    test.submissions.forEach((sub, i) => { sub.rank = i + 1; });
    await test.save();

    res.json({ success: true, totalScore, percentage, rank: test.submissions.find(s => s.student.toString() === req.user._id.toString())?.rank });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/tests/:id/results
router.get('/:id/results', protect, async (req, res) => {
  try {
    const test = await CollegeTest.findById(req.params.id)
      .populate('submissions.student', 'name email college');
    const sorted = test.submissions.sort((a, b) => b.totalScore - a.totalScore);
    res.json({ success: true, results: sorted, test: { title: test.title, college: test.college } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
