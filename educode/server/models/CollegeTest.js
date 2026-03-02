const mongoose = require('mongoose');

const collegeTestSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  college:      { type: String, required: true },
  description:  { type: String, default: '' },
  mcqQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  codingQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  duration:     { type: Number, required: true }, // minutes
  totalMarks:   { type: Number, default: 0 },
  passingScore: { type: Number, default: 60 },
  startTime:    { type: Date, required: true },
  endTime:      { type: Date },
  status:       { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxStudents:  { type: Number, default: 500 },
  testCode:     { type: String, unique: true }, // unique code students use to join
  submissions: [{
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mcqAnswers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedOption: Number, isCorrect: Boolean, marks: Number }],
    codingAnswers: [{ questionId: mongoose.Schema.Types.ObjectId, code: String, language: String, passed: Number, total: Number, marks: Number }],
    totalScore: Number,
    percentage: Number,
    rank:       Number,
    timeTaken:  Number,
    submittedAt:{ type: Date, default: Date.now },
    status:     { type: String, enum: ['in_progress', 'submitted', 'auto_submitted'], default: 'submitted' },
  }],
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  settings: {
    shuffleQuestions:  { type: Boolean, default: true },
    shuffleOptions:    { type: Boolean, default: false },
    showResult:        { type: Boolean, default: true },
    preventCopyPaste:  { type: Boolean, default: true },
    fullScreenMode:    { type: Boolean, default: true },
  }
}, { timestamps: true });

// Auto-generate test code
collegeTestSchema.pre('save', function(next) {
  if (!this.testCode) {
    this.testCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (!this.endTime && this.startTime) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  }
  next();
});

module.exports = mongoose.model('CollegeTest', collegeTestSchema);
