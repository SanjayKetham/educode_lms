const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['mcq', 'coding'], required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['DSA', 'C', 'Java', 'SQL'], required: true },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  marks:       { type: Number, default: 2 },

  // MCQ specific
  options:     [{ type: String }],
  correctAnswer: { type: Number }, // index of correct option

  // Coding specific
  examples: [{
    input:      String,
    output:     String,
    explanation:String,
  }],
  testCases: [{
    input:      String,
    output:     String,
    isHidden:   { type: Boolean, default: false },
  }],
  starterCode: {
    c:      { type: String, default: '' },
    cpp:    { type: String, default: '' },
    java:   { type: String, default: '' },
    python: { type: String, default: '' },
  },
  constraints: { type: String, default: '' },
  hints:       [String],
  solvedCount: { type: Number, default: 0 },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
