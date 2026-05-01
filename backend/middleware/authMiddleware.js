const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Not authorized. Please log in." });

  try {
    req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "dev_jwt_secret");
    next();
  } catch {
    res.status(401).json({ error: "Token expired. Please log in again." });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: "Access denied." });
  next();
};
