const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Simulated compiler - Replace with Judge0 API in production:
// POST https://judge0-ce.p.rapidapi.com/submissions
// For real execution, use: https://github.com/judge0/judge0

const sampleOutputs = {
  c: 'Hello, World!\n',
  cpp: 'Hello, World!\n',
  java: 'Hello, World!\n',
  python: 'Hello, World!\n',
  sql: '+----+-------+\n| id | name  |\n+----+-------+\n|  1 | Alice |\n|  2 | Bob   |\n+----+-------+\n2 rows in set',
};

router.post('/run', protect, async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'No code provided' });

    // --- PRODUCTION: Replace block below with Judge0 API call ---
    // const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?wait=true', {
    //   source_code: Buffer.from(code).toString('base64'),
    //   language_id: LANGUAGE_IDS[language],
    //   stdin: stdin ? Buffer.from(stdin).toString('base64') : undefined,
    // }, { headers: { 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY } });
    // ---------------------------------------------------------------

    // Simulated execution
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    let output = sampleOutputs[language] || 'Program executed successfully.\n';
    if (code.includes('error') || code.includes('Error')) {
      return res.json({ success: true, status: 'error', output: '', error: 'CompileError: syntax error near line 3', runtime: null });
    }
    if (stdin) output += `\nWith input: ${stdin}`;

    res.json({
      success: true,
      status: 'accepted',
      output,
      error: null,
      runtime: `${(Math.random() * 0.1 + 0.01).toFixed(3)}s`,
      memory: `${Math.floor(Math.random() * 5000 + 1000)} KB`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
