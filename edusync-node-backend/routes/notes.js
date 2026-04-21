// edusync-node-backend/routes/notes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Note = require('../models/Note');

// ── Multer Storage Configuration ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = `${timestamp}-${random}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are accepted'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// GET /api/notes — Fetch all notes, newest first
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ uploadDate: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve notes', error: err.message });
  }
});

// POST /api/notes — Upload a new PDF note
router.post('/', (req, res) => {
  upload.single('pdf')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, subject, author } = req.body;
    if (!title || !subject || !author) {
      return res.status(400).json({ message: 'title, subject, and author are required' });
    }

    try {
      const note = new Note({
        title,
        subject,
        author,
        originalFileName: req.file.originalname,
        fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
      });

      const saved = await note.save();
      res.status(201).json(saved);
    } catch (dbErr) {
      res.status(500).json({ message: 'Failed to save note record', error: dbErr.message });
    }
  });
});

module.exports = router;