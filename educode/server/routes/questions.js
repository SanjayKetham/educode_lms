const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/questions - Get all questions
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, difficulty } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    const questions = await Question.find(filter).select('-testCases').populate('createdBy', 'name');
    const user = await User.findById(req.user._id);
    const solved = user.solvedProblems.map(id => id.toString());
    const questionsWithStatus = questions.map(q => ({
      ...q.toObject(),
      solved: solved.includes(q._id.toString())
    }));
    res.json({ success: true, questions: questionsWithStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/questions/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'name');
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    const user = await User.findById(req.user._id);
    const solved = user.solvedProblems.map(id => id.toString()).includes(question._id.toString());
    res.json({ success: true, question: { ...question.toObject(), solved } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/questions - Create question (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/questions/:id - Update question (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/questions/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/questions/:id/submit - Submit coding solution
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || question.type !== 'coding') {
      return res.status(400).json({ success: false, message: 'Invalid coding question' });
    }
    // Simulate test case execution
    const { code, language } = req.body;
    const results = question.testCases.map((tc, i) => ({
      testCase: i + 1,
      passed: Math.random() > 0.3, // Replace with real judge0 API in production
      input: tc.isHidden ? 'Hidden' : tc.input,
      expected: tc.isHidden ? 'Hidden' : tc.output,
      runtime: `${Math.floor(Math.random() * 100 + 10)}ms`,
    }));
    const allPassed = results.every(r => r.passed);
    if (allPassed) {
      const user = await User.findById(req.user._id);
      if (!user.solvedProblems.includes(question._id)) {
        user.solvedProblems.push(question._id);
        user.totalScore += question.marks * 10;
        await user.save();
        question.solvedCount += 1;
        await question.save();
      }
    }
    res.json({ success: true, results, allPassed, passed: results.filter(r => r.passed).length, total: results.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
