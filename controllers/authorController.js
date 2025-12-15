const {postModel }= require("../models/postModel.js");

// Dashboard
const dashboard = async (req, res) => {
  const posts = await postModel.find({ author: req.user._id });
  res.json({message:"user posts fetched successfully",posts});
};

// Create post
const createPost = async (req, res) => {
  const { title, content, status } = req.body;

  if(!title || !content || !status){
    return res.json("please fill all fields")
  }
  // Default to draft if status not provided
  const post = await postModel.create({
    title,
    content,
    author: req.user._id,
    status: status || "draft"
  });

  res.json({message:"post created successfully",details:post});
};

// Edit own post
const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;   
    const { title, content, status } = req.body;
   
    if (!title && !content && !status) {
      return res.status(400).json({ message: "Provide at least one field (title, content, status) to update." });
    }
    // Build the update object dynamically
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    const updatedPost = await postModel.findOneAndUpdate(
      { _id: postId, author: userId }, 
      updateData,
      { new: true } 
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found or you are not authorized to edit it." });
    }
    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).json({ message: "Server error while updating the post." });
  }
};


// Delete own post
 const deletePost = async (req, res) => {
  const post = await postModel.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id
  });

  if (!post) {
    return res.status(404).json({
      message: "postModel not found or you are not allowed to delete it"
    });
  }

  res.json({ message: "postModel deleted successfully" });
};


// View posts
const viewPosts = async (req, res) => {
  const posts = await postModel.find({ status: "published" });
  res.json({message:"fetched published posts suceessfully",posts});
};
module.exports = { author: { dashboard, createPost, editPost, deletePost, viewPosts } };