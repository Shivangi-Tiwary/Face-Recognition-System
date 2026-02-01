const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs').promises;
const { ipKeyGenerator } = require('express-rate-limit');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// IPv6-safe rate limiters
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many registration attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req)
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req)
});

const faceAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many face authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req)
});

// Helper: convert buffer → base64
const bufferToBase64 = (buffer, mimetype) => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

module.exports = {
  upload,
  registrationLimiter,
  loginLimiter,
  faceAuthLimiter,
  bufferToBase64
};
