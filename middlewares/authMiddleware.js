const jwt = require("jsonwebtoken");
const {userModel} = require("../models/authModel.js");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user || user.status !== "active") {
      return res.status(403).json({ message: "Account disabled" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};


module.exports={auth:authMiddleware}
