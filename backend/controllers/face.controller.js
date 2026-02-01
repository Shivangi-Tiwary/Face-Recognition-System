const axios = require("axios");
const User = require("../models/User");
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Enroll face for existing user
exports.enrollFace = async (req, res, next) => {
  try {
    const { image } = req.body;
    const userId = req.user.id;
    
    if (!image) return res.status(400).json({ error: "Image missing" });
    
    // Extract embedding
    const embeddingResponse = await axios.post("http://localhost:8000/extract-embedding", {
      image,
      user_id: userId
    });
    
    const embedding = embeddingResponse.data.embedding;
    
    // Upload to Supabase
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    
    const { error: uploadError } = await supabase.storage
      .from('faces')
      .upload(`${userId}.jpg`, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('faces')
      .getPublicUrl(`${userId}.jpg`);
    
    // Update user
    await User.findByIdAndUpdate(userId, {
      faceEmbedding: embedding,
      faceImageUrl: publicUrl,
      faceEnrolled: true,
      enrolledAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: "Face enrolled successfully",
      faceImageUrl: publicUrl
    });
  } catch (err) {
    next(err);
  }
};

// Test recognition (for debugging)
exports.recognizeFace = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image missing" });
    
    const enrolledUsers = await User.find({ 
      faceEnrolled: true,
      faceEmbedding: { $exists: true }
    }).select('_id faceEmbedding name');
    
    if (enrolledUsers.length === 0) {
      return res.status(404).json({ error: "No enrolled faces" });
    }
    
    const storedEmbeddings = {};
    enrolledUsers.forEach(user => {
      storedEmbeddings[user._id.toString()] = user.faceEmbedding;
    });
    
    const response = await axios.post("http://localhost:8000/compare-embeddings", {
      image,
      stored_embeddings: storedEmbeddings
    });
    
    res.json(response.data);
  } catch (err) {
    next(err);
  }
};