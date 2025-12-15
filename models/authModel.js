
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // null for Google OAuth users
  role: { type: String, enum: ["admin", "author"], default: "author" },

  permissions: {
    canViewPosts: { type: Boolean, default: true },
    canCreatePosts: { type: Boolean, default: true },
    canEditPosts: { type: Boolean, default: true },
    canDeletePosts: { type: Boolean, default: true }
  },
   adminApplication: {
   applicationStatus:  { type: String, enum: ['none','pending','rejected','approved'], default: 'none' },
    docsfile: { type: String},
    appliedAt: Date,
    reviewedAt: Date
  },
  status: { type: String, enum: ["active", "disabled"], default: "active" },

  provider: { type: String, enum: ["email", "google"], default: "email" },

}, { timestamps: true });


const userModel = mongoose.model('User', userSchema);

module.exports={userModel}
