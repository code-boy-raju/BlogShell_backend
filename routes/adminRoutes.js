const router = require("express").Router();
const {auth} = require("../middlewares/authMiddleware.js");
const {roleMiddleware} = require("../middlewares/roleMiddleware.js");
const {admin} = require("../controllers/adminController.js");

router.use(auth, roleMiddleware("admin"));

router.get("/details", admin.dashboard);
router.get("/authors", admin.getAuthors);
router.post("/addauthor", admin.addAuthor);
router.put("/permission/:id", admin.assignPermissions);
router.put("/status/:id", admin.toggleAuthor);
router.delete("/removeauthor/:id", admin.deleteAuthor);
router.get("/posts", admin.managePosts);
router.put("/editposts/:id",admin.editPost)
router.delete("/deletepost/:id",admin.deletePost)
module.exports = router;
