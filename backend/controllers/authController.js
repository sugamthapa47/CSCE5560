const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { sendOTPEmail } = require("../utils/emailService");

const SALT_ROUNDS = 12;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev_jwt_secret",
    { expiresIn: "2h" }
  );
}

// POST /api/auth/register
exports.register = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password needs an uppercase letter")
    .matches(/[0-9]/).withMessage("Password needs a number")
    .matches(/[!@#$%^&*]/).withMessage("Password needs a special character (!@#$%^&*)"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
      if (existing.length > 0)
        return res.status(409).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashed]);

      res.status(201).json({ message: "Account created. Please log in." });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  },
];

// POST /api/auth/login
exports.login = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (rows.length === 0)
        return res.status(401).json({ error: "Invalid email or password" });

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res.status(401).json({ error: "Invalid email or password" });

      const otp     = generateOTP();
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      await db.query("DELETE FROM otp_tokens WHERE user_id = ?", [user.id]);
      await db.query(
        "INSERT INTO otp_tokens (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
        [user.id, otp, expires]
      );

      await sendOTPEmail(user.email, user.name, otp);

      req.session.pendingUserId = user.id;
      res.json({ message: "OTP sent to your email. Valid for 5 minutes." });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  },
];

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  const { otp }   = req.body;
  const userId    = req.session.pendingUserId;

  if (!userId) return res.status(401).json({ error: "No active login session. Please log in first." });
  if (!otp)    return res.status(400).json({ error: "OTP is required" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM otp_tokens WHERE user_id = ? AND otp_code = ? AND expires_at > NOW()",
      [userId, otp]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid or expired OTP" });

    await db.query("DELETE FROM otp_tokens WHERE user_id = ?", [userId]);
    req.session.destroy();

    const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    const user  = userRows[0];
    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile" });
  }
};

// ── POST /api/auth/forgot-password ─────────────────────────
// Sends a password-reset OTP to the user's email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);

    // Always return success to avoid user enumeration
    if (rows.length === 0) {
      return res.json({ message: "If that email exists, a reset code has been sent." });
    }

    const user    = rows[0];
    const otp     = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min for reset

    // Reuse otp_tokens table with a special marker (store in session too)
    await db.query("DELETE FROM otp_tokens WHERE user_id = ?", [user.id]);
    await db.query(
      "INSERT INTO otp_tokens (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
      [user.id, otp, expires]
    );

    // Send reset email
    await sendOTPEmail(user.email, user.name, otp);

    // Store user id in session for the reset step
    req.session.resetUserId = user.id;

    res.json({ message: "If that email exists, a reset code has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

// ── POST /api/auth/reset-password ──────────────────────────
// Verifies OTP and sets new password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ error: "Email, OTP, and new password are required." });

  // Validate password strength
  const pwReg = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!pwReg.test(newPassword))
    return res.status(400).json({ error: "Password must be 8+ characters with uppercase, number, and symbol." });

  try {
    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (userRows.length === 0)
      return res.status(404).json({ error: "User not found." });

    const user = userRows[0];

    const [otpRows] = await db.query(
      "SELECT * FROM otp_tokens WHERE user_id = ? AND otp_code = ? AND expires_at > NOW()",
      [user.id, otp]
    );
    if (otpRows.length === 0)
      return res.status(401).json({ error: "Invalid or expired reset code." });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, user.id]);
    await db.query("DELETE FROM otp_tokens WHERE user_id = ?", [user.id]);

    if (req.session) req.session.destroy();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Password reset failed. Please try again." });
  }
};
