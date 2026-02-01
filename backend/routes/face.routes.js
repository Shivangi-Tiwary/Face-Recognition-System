const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { recognizeFace, enrollFace } = require("../controllers/face.controller");

// Upload middleware for face image
router.post("/enroll", auth.upload.single("faceImage"), enrollFace);
router.post("/recognize", auth.upload.single("faceImage"), recognizeFace);

module.exports = router;
