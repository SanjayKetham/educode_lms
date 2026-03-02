const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');
const Question = require('./models/Question');
const Assessment = require('./models/Assessment');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educode_lms';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear
  await Promise.all([User.deleteMany(), Course.deleteMany(), Question.deleteMany(), Assessment.deleteMany()]);
  console.log('Cleared existing data');

  // Users
  const adminPass = await bcrypt.hash('admin123', 12);
  const studentPass = await bcrypt.hash('student123', 12);

  const admin = await User.create({ name: 'Admin User', email: 'admin@educode.com', password: adminPass, role: 'admin' });
  const student = await User.create({ name: 'Demo Student', email: 'student@educode.com', password: studentPass, role: 'student', college: 'ABC Engineering College', streak: 12, totalScore: 250 });
  const college = await User.create({ name: 'ABC College', email: 'college@abc.edu', password: await bcrypt.hash('college123', 12), role: 'college', college: 'ABC Engineering College' });
  console.log('✅ Users created');

  // Courses
  const courses = await Course.insertMany([
    {
      title: 'Data Structures & Algorithms', category: 'DSA', description: 'Master arrays, linked lists, trees, graphs, and sorting algorithms.', level: 'Intermediate', icon: '🗂️', color: 'rgba(0,212,255,0.12)',
      enrolledCount: 1240, createdBy: admin._id,
      lessons: [
        { title: 'Introduction to DSA', content: 'Data structures are ways of organizing data. Algorithms are step-by-step procedures to solve problems...', duration: 15, order: 1 },
        { title: 'Arrays and Strings', content: 'Arrays store elements in contiguous memory. Time complexity for access is O(1)...', duration: 20, order: 2 },
        { title: 'Linked Lists', content: 'A linked list is a linear data structure where elements are stored in nodes...', duration: 25, order: 3 },
        { title: 'Stacks and Queues', content: 'Stack: LIFO. Queue: FIFO. Both can be implemented using arrays or linked lists...', duration: 20, order: 4 },
        { title: 'Binary Trees', content: 'A binary tree is a tree data structure where each node has at most two children...', duration: 30, order: 5 },
      ]
    },
    {
      title: 'Java Programming', category: 'Java', description: 'From basics to OOP, collections, multithreading, and Spring fundamentals.', level: 'Beginner', icon: '☕', color: 'rgba(124,58,237,0.12)',
      enrolledCount: 980, createdBy: admin._id,
      lessons: [
        { title: 'Introduction to Java', content: 'Java is a high-level, class-based, object-oriented programming language...', duration: 15, order: 1 },
        { title: 'Variables and Data Types', content: 'Java has 8 primitive data types: byte, short, int, long, float, double, char, boolean...', duration: 20, order: 2 },
        { title: 'OOP Concepts', content: 'Object-Oriented Programming has four pillars: Encapsulation, Inheritance, Polymorphism, Abstraction...', duration: 30, order: 3 },
      ]
    },
    {
      title: 'SQL & Databases', category: 'SQL', description: 'SQL queries, joins, indexes, transactions, and database design.', level: 'Beginner', icon: '🗄️', color: 'rgba(16,185,129,0.12)',
      enrolledCount: 870, createdBy: admin._id,
      lessons: [
        { title: 'Introduction to SQL', content: 'SQL (Structured Query Language) is used to manage relational databases...', duration: 15, order: 1 },
        { title: 'SELECT Queries', content: 'The SELECT statement retrieves data from tables. SELECT column FROM table WHERE condition...', duration: 20, order: 2 },
        { title: 'JOINs', content: 'JOINs combine rows from multiple tables: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN...', duration: 25, order: 3 },
      ]
    },
    {
      title: 'C Programming', category: 'C', description: 'Pointers, memory management, file I/O, and systems programming.', level: 'Beginner', icon: '⚙️', color: 'rgba(245,158,11,0.12)',
      enrolledCount: 760, createdBy: admin._id,
      lessons: [
        { title: 'Introduction to C', content: 'C is a procedural, general-purpose programming language developed in 1972...', duration: 15, order: 1 },
        { title: 'Pointers', content: 'A pointer is a variable that stores the memory address of another variable...', duration: 30, order: 2 },
        { title: 'Memory Management', content: 'C provides malloc(), calloc(), realloc(), and free() for dynamic memory allocation...', duration: 25, order: 3 },
      ]
    },
  ]);
  console.log('✅ Courses created');

  // Questions
  const mcqs = await Question.insertMany([
    { type:'mcq', title:'Time complexity of binary search', description:'What is the time complexity of binary search on a sorted array?', category:'DSA', difficulty:'easy', marks:2, options:['O(n)','O(log n)','O(n²)','O(1)'], correctAnswer:1, createdBy:admin._id },
    { type:'mcq', title:'LIFO data structure', description:'Which data structure uses LIFO (Last In First Out) principle?', category:'DSA', difficulty:'easy', marks:2, options:['Queue','Stack','Array','Hash Map'], correctAnswer:1, createdBy:admin._id },
    { type:'mcq', title:'Java final keyword', description:'What keyword in Java is used to prevent method overriding?', category:'Java', difficulty:'medium', marks:2, options:['static','abstract','final','private'], correctAnswer:2, createdBy:admin._id },
    { type:'mcq', title:'SQL HAVING clause', description:'Which SQL clause is used to filter rows after GROUP BY?', category:'SQL', difficulty:'easy', marks:2, options:['WHERE','HAVING','ORDER BY','SELECT'], correctAnswer:1, createdBy:admin._id },
    { type:'mcq', title:'sizeof int in C', description:'What is the output of printf("%d", sizeof(int)) on a 64-bit system?', category:'C', difficulty:'medium', marks:2, options:['2','4','8','16'], correctAnswer:1, createdBy:admin._id },
    { type:'mcq', title:'Merge sort complexity', description:'What is the time complexity of merge sort in worst case?', category:'DSA', difficulty:'medium', marks:2, options:['O(n)','O(n log n)','O(n²)','O(log n)'], correctAnswer:1, createdBy:admin._id },
    { type:'mcq', title:'Java interface vs abstract class', description:'Which can have constructors in Java?', category:'Java', difficulty:'medium', marks:2, options:['Interface','Abstract Class','Both','Neither'], correctAnswer:1, createdBy:admin._id },
    { type:'mcq', title:'Primary key constraint', description:'Which SQL constraint ensures a column has unique, non-null values?', category:'SQL', difficulty:'easy', marks:2, options:['UNIQUE','NOT NULL','PRIMARY KEY','FOREIGN KEY'], correctAnswer:2, createdBy:admin._id },
    { type:'mcq', title:'C pointer arithmetic', description:'What does *(ptr+1) access when ptr is an int pointer?', category:'C', difficulty:'hard', marks:3, options:['ptr+1 bytes ahead','Next int (4 bytes ahead)','Previous element','ptr itself'], correctAnswer:1, createdBy:admin._id },
    { type:'mcq', title:'BFS time complexity', description:'What is the time complexity of Breadth First Search?', category:'DSA', difficulty:'medium', marks:2, options:['O(V)','O(E)','O(V+E)','O(V*E)'], correctAnswer:2, createdBy:admin._id },
  ]);

  const coding = await Question.insertMany([
    {
      type:'coding', title:'Two Sum', category:'DSA', difficulty:'easy', marks:5,
      description:'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
      examples:[{ input:'nums = [2,7,11,15], target = 9', output:'[0,1]', explanation:'nums[0]+nums[1]=9' }],
      testCases:[{ input:'[2,7,11,15]\n9', output:'[0,1]' },{ input:'[3,2,4]\n6', output:'[1,2]', isHidden:true }],
      starterCode:{ c:'#include <stdio.h>\nvoid twoSum(int* nums, int n, int target) {\n    // Your code here\n}', java:'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}', python:'def twoSum(nums, target):\n    # Your code here\n    pass' },
      constraints:'2 <= nums.length <= 10^4', createdBy:admin._id
    },
    {
      type:'coding', title:'Fibonacci Number', category:'DSA', difficulty:'easy', marks:5,
      description:'Given n, calculate F(n) where F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).',
      examples:[{ input:'n = 5', output:'5', explanation:'F(5) = 0,1,1,2,3,5' }],
      testCases:[{ input:'5', output:'5' },{ input:'10', output:'55', isHidden:true }],
      starterCode:{ c:'#include <stdio.h>\nint fib(int n) {\n    // Your code here\n}', java:'class Solution {\n    public int fib(int n) {\n        // Your code here\n    }\n}', python:'def fib(n):\n    # Your code here\n    pass' },
      createdBy:admin._id
    },
    {
      type:'coding', title:'Reverse String', category:'DSA', difficulty:'easy', marks:5,
      description:'Write a function that reverses a string in-place.',
      examples:[{ input:'["h","e","l","l","o"]', output:'["o","l","l","e","h"]' }],
      testCases:[{ input:'hello', output:'olleh' },{ input:'abcde', output:'edcba', isHidden:true }],
      starterCode:{ c:'#include <stdio.h>\nvoid reverseString(char* s) {\n    // Your code here\n}', python:'def reverseString(s):\n    # Your code here\n    pass' },
      createdBy:admin._id
    },
  ]);
  console.log('✅ Questions created');

  // Assessment
  const ass = await Assessment.create({
    title: 'DSA Fundamentals Quiz', category:'DSA', description:'Test your knowledge of basic DSA concepts.',
    questions: mcqs.slice(0,5).map(q=>q._id), duration:30, totalMarks:10, passingScore:60,
    status:'open', isPublic:true, createdBy:admin._id
  });
  console.log('✅ Assessment created');

  // Enroll student in courses
  const studentDoc = await User.findById(student._id);
  studentDoc.enrolledCourses = courses.map(c=>c._id);
  studentDoc.courseProgress = courses.map(c=>({ course:c._id, progress: Math.floor(Math.random()*80)+10, completedLessons:[0,1] }));
  studentDoc.solvedProblems = [coding[0]._id];
  await studentDoc.save();

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@educode.com / admin123');
  console.log('  Student: student@educode.com / student123');
  console.log('  College: college@abc.edu / college123\n');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
