const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6, select: false },
  role:         { type: String, enum: ['student', 'admin', 'college'], default: 'student' },
  college:      { type: String, default: '' },
  avatar:       { type: String, default: '' },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  courseProgress: [{
    course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progress: { type: Number, default: 0 },
    completedLessons: [Number]
  }],
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  streak:       { type: Number, default: 0 },
  lastActive:   { type: Date, default: Date.now },
  totalScore:   { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
