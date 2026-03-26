const jwt = require("jsonwebtoken");

exports.authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to req
      req.user = {
        userId: decoded.userId || decoded.id,
        role: decoded.role,
        email: decoded.email, // make sure email is included in JWT payload
      };

      // Role check
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

// Middleware that blocks recruiters from taking interviews
exports.candidateOnly = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    if (req.user.role === "recruiter") {
      return res
        .status(403)
        .json({ message: "Recruiters cannot take interviews" });
    }

    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

