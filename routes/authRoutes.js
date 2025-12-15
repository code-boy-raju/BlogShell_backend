const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../config/multer.js");
const router = express.Router();
const {
  authorSignup,
  adminSignup,
  verifyAdmin,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers.js");
require("dotenv").config()


router.post("/authorsignup", authorSignup);
router.post("/adminsignup", uploadFile.single("file"), adminSignup);
router.get("/verifyadmin", verifyAdmin); 
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// STEP 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
    accessType: "offline",
  })
);

// STEP 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email, permissions:user.permissions },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);

module.exports = router;
