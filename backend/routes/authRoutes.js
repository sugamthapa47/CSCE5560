const express = require("express");
const r = express.Router();
const c = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { loginLimiter, otpLimiter } = require("../middleware/rateLimiter");

r.post("/register",         c.register);
r.post("/login",            loginLimiter, c.login);
r.post("/verify-otp",       otpLimiter,   c.verifyOTP);
r.get( "/profile",          protect,      c.getProfile);
r.post("/forgot-password",  loginLimiter, c.forgotPassword);
r.post("/reset-password",   otpLimiter,   c.resetPassword);

module.exports = r;
