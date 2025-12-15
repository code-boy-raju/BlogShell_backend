const router = require("express").Router();
const {auth} = require("../middlewares/authMiddleware.js");
const {roleMiddleware} = require("../middlewares/roleMiddleware.js");
const {perm}=require("../middlewares/permissionMiddleware.js")
const {author}=require("../controllers/authorController.js")

router.use(auth, roleMiddleware("author"));

router.get("/personposts", author.dashboard);
router.post("/createposts", perm("canCreatePosts"), author.createPost);
router.put("/editposts/:id", perm("canEditPosts"), author.editPost);
router.delete("/deleteposts/:id", perm("canDeletePosts"), author.deletePost);
router.get("/getposts", perm("canViewPosts"), author.viewPosts);

module.exports = router;





