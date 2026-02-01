const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');
const { upload, registrationLimiter, loginLimiter, faceAuthLimiter, bufferToBase64 } = require("../middleware/auth.middleware");

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Regular registration
exports.register = [
  registrationLimiter,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ error: "All fields required" });

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.status(201).json({ success: true, token, user });
    } catch (err) {
      next(err);
    }
  }
];

// Login
exports.login = [
  loginLimiter,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Wrong password" });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token, user });
    } catch (err) {
      next(err);
    }
  }
];

// Register with face
exports.registerWithFace = [
  registrationLimiter,
  upload.single("faceImage"),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const imageFile = req.file;
      if (!name || !email || !password || !imageFile)
        return res.status(400).json({ error: "All fields and face image required" });

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });

      try {
        // Convert buffer → base64
        const base64Image = bufferToBase64(imageFile.buffer, imageFile.mimetype);

        // Send to FastAPI
        const embeddingResponse = await axios.post("http://localhost:8000/extract-embedding", {
          image: base64Image,
          user_id: user._id.toString()
        });

        const embedding = embeddingResponse.data.embedding;

        // Upload image to Supabase
        const { data, error } = await supabase.storage
          .from("faces")
          .upload(`${user._id}.jpg`, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from("faces").getPublicUrl(`${user._id}.jpg`);

        // Save to Mongo
        user.faceEmbedding = embedding;
        user.faceImageUrl = publicUrl;
        user.faceEnrolled = true;
        user.enrolledAt = new Date();
        await user.save();

      } catch (faceError) {
        console.log("FACE PIPELINE FAILED:", faceError.message);

  console.error("Error message:", faceError.message);
  console.error("Error response:", faceError.response?.data);
  console.error("Error status:", faceError.response?.status);
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.status(201).json({ success: true, token, user });
    } catch (err) {
      next(err);
    }
  }
];

// Login with face
exports.loginWithFace = [
  faceAuthLimiter,
  upload.single("faceImage"),
  async (req, res, next) => {
    try {
      const imageFile = req.file;
      if (!imageFile) return res.status(400).json({ error: "Face image required" });

      const base64Image = bufferToBase64(imageFile.buffer, imageFile.mimetype);

      // Get enrolled users
      const enrolledUsers = await User.find({ faceEnrolled: true, faceEmbedding: { $exists: true, $ne: null } });

      if (enrolledUsers.length === 0) return res.status(404).json({ error: "No enrolled faces found" });

      const storedEmbeddings = {};
      enrolledUsers.forEach(u => storedEmbeddings[u._id.toString()] = u.faceEmbedding);

      // Compare with FastAPI
      const response = await axios.post("http://localhost:8000/compare-embeddings", {
        image: base64Image,
        stored_embeddings: storedEmbeddings
      });

      const { user_id, confidence } = response.data;
      const user = await User.findById(user_id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.lastFaceLogin = new Date();
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token, user, confidence, message: `Welcome back, ${user.name}!` });

    } catch (err) {
      if (err.response?.status === 404)
        return res.status(404).json({ error: "Face not recognized", confidence: 0 });
      next(err);
    }
  }
];
