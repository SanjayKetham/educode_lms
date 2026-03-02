const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ role: 'student', isActive: true })
      .select('name college totalScore solvedProblems streak')
      .sort({ totalScore: -1 })
      .limit(50);
    const ranked = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      name: u.name,
      college: u.college,
      totalScore: u.totalScore,
      solved: u.solvedProblems.length,
      streak: u.streak,
      isCurrentUser: u._id.toString() === req.user._id.toString(),
    }));
    res.json({ success: true, leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
