const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  content:     { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  duration:    { type: Number, default: 0 }, // minutes
  order:       { type: Number, required: true },
  resources:   [{ title: String, url: String }],
});

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['DSA', 'C', 'Java', 'SQL'], required: true },
  level:       { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  icon:        { type: String, default: '📚' },
  color:       { type: String, default: 'rgba(0,212,255,0.15)' },
  lessons:     [lessonSchema],
  totalLessons:{ type: Number, default: 0 },
  enrolledCount:{ type: Number, default: 0 },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:    { type: Boolean, default: true },
  thumbnail:   { type: String, default: '' },
  assessment:  { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  tags:        [String],
}, { timestamps: true });

courseSchema.pre('save', function(next) {
  this.totalLessons = this.lessons.length;
  next();
});

module.exports = mongoose.model('Course', courseSchema);
