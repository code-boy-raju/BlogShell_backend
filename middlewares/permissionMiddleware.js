
const permissonMiddleware= (permission) => (req, res, next) => {
  if (!req.user.permissions[permission]) {
    return res.status(403).json({ message: "Permission denied" });
  }
  next();
};

module.exports={perm:permissonMiddleware}