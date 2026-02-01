const router = require("express").Router();
const {
  register,
  registerWithFace,
  login,
  loginWithFace
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/register-with-face", registerWithFace);
router.post("/login", login);
router.post("/login-with-face", loginWithFace);

module.exports = router;
