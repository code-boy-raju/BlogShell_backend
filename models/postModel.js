const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  }
}, { timestamps: true });

const postModel = mongoose.model("Posts", postSchema);
module.exports={postModel}