const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/courses - Get all courses
router.get('/', protect, async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const courses = await Course.find(filter).populate('createdBy', 'name').select('-lessons');
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/courses/:id - Get single course with lessons
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const isEnrolled = req.user.enrolledCourses.includes(course._id);
    const progress = req.user.courseProgress.find(p => p.course.toString() === course._id.toString());
    res.json({ success: true, course, isEnrolled, progress: progress || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/courses/:id/enroll - Enroll in course
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }
    user.enrolledCourses.push(course._id);
    user.courseProgress.push({ course: course._id, progress: 0, completedLessons: [] });
    await user.save();
    course.enrolledCount += 1;
    await course.save();
    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/courses/:id/progress - Update lesson progress
router.put('/:id/progress', protect, async (req, res) => {
  try {
    const { lessonIndex } = req.body;
    const user = await User.findById(req.user._id);
    const progressEntry = user.courseProgress.find(p => p.course.toString() === req.params.id);
    if (!progressEntry) return res.status(400).json({ success: false, message: 'Not enrolled' });
    if (!progressEntry.completedLessons.includes(lessonIndex)) {
      progressEntry.completedLessons.push(lessonIndex);
    }
    const course = await Course.findById(req.params.id);
    progressEntry.progress = Math.round((progressEntry.completedLessons.length / course.totalLessons) * 100);
    await user.save();
    res.json({ success: true, progress: progressEntry.progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/courses - Create course (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/courses/:id - Update course (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/courses/:id - Delete course (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
