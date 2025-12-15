
const { userModel } = require("../models/authModel.js");
const { postModel } = require("../models/postModel.js");
const { sendEmail } = require("../services/emailservice.js");
const bcrypt = require("bcrypt");


//    1. ADMIN DASHBOARD

const dashboard = async (req, res) => {
  try {
    const authors = await userModel.countDocuments({ role: "author" });
    const activeAuthors = await userModel.countDocuments({
      role: "author",
      status: "active",
    });
    const posts = await postModel.countDocuments();

    res.json({ authors, activeAuthors, posts });
  } catch (err) {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};


//    2. GET ALL AUTHORS

const getAuthors = async (req, res) => {
  try {
    const authors = await userModel.find({ role: "author" }).select("-password");
    res.json(authors);
  } catch {
    res.status(500).json({ message: "Failed to fetch authors" });
  }
};


//    3. ADD AUTHOR

const addAuthor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Author already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const author = await userModel.create({
      name,
      email,
      password: hashed,
      role: "author",
      status: "active",
      permissions: {
        canViewPosts: true,
        canCreatePosts: true,
        canEditPosts: false,
        canDeletePosts: false,
      },
    });

    await sendEmail(
      email,
      "Author Account Created",
      `<p>Email: ${email}<br/>Password: ${password}</p>`
    );

    res.status(201).json(author);
  } catch (err) {
    res.status(500).json({ message: "Author creation failed" });
  }
};


//    4. ASSIGN PERMISSIONS

const assignPermissions = async (req, res) => {
  try {
    const permissions = {
      canViewPosts: Boolean(req.body.canViewPosts),
      canCreatePosts: Boolean(req.body.canCreatePosts),
      canEditPosts: Boolean(req.body.canEditPosts),
      canDeletePosts: Boolean(req.body.canDeletePosts),
    };

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.json({
      message: "Permissions updated",
      permissions: user.permissions,
    });
  } catch {
    res.status(500).json({ message: "Permission update failed" });
  }
};


//    5. TOGGLE AUTHOR STATUS

const toggleAuthor = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Author not found" });

    user.status = user.status === "active" ? "disabled" : "active";
    await user.save();

    res.json({ message: "Status updated", status: user.status });
  } catch {
    res.status(500).json({ message: "Status toggle failed" });
  }
};


//    6. DELETE AUTHOR

const deleteAuthor = async (req, res) => {
  try {
    const deleted = await userModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Author not found" });
    }
    res.json({ message: "Author deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};


//    7. MANAGE POSTS (ADMIN)

const managePosts = async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("author", "name email");

    res.json(posts);
  } catch {
    res.status(500).json({ message: "Post fetch failed" });
  }
};


//    8. ADMIN EDIT POST (FIXED)

const editPost = async (req, res) => {
  try {
    const { title, content, status } = req.body;

    if (!title && !content && !status) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    const post = await postModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      message: "Post updated by admin successfully",
      post,
    });
  } catch {
    res.status(500).json({ message: "Admin post update failed" });
  }
};


//    9. ADMIN DELETE POST

const deletePost = async (req, res) => {
  try {
    const post = await postModel.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted by admin" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

module.exports = {
  admin: {
    dashboard,
    getAuthors,
    addAuthor,
    assignPermissions,
    toggleAuthor,
    deleteAuthor,
    managePosts,
    editPost,
    deletePost,
  },
};
