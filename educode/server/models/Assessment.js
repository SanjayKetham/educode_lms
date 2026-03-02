const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers:     [{ questionId: mongoose.Schema.Types.ObjectId, selectedOption: Number, code: String, isCorrect: Boolean, marksAwarded: Number }],
  score:       { type: Number, default: 0 },
  totalMarks:  { type: Number, default: 0 },
  percentage:  { type: Number, default: 0 },
  timeTaken:   { type: Number, default: 0 }, // seconds
  submittedAt: { type: Date, default: Date.now },
  status:      { type: String, enum: ['in_progress', 'submitted', 'auto_submitted'], default: 'submitted' },
});

const assessmentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  category:    { type: String, enum: ['DSA', 'C', 'Java', 'SQL', 'Mixed'], default: 'Mixed' },
  questions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  duration:    { type: Number, required: true }, // minutes
  totalMarks:  { type: Number, default: 0 },
  passingScore:{ type: Number, default: 60 }, // percentage
  startTime:   { type: Date },
  endTime:     { type: Date },
  status:      { type: String, enum: ['draft', 'open', 'closed', 'upcoming'], default: 'draft' },
  allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublic:    { type: Boolean, default: true },
  submissions: [submissionSchema],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shuffleQuestions: { type: Boolean, default: false },
  showResult:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
