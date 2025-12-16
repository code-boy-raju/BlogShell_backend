
const mongoose = require("mongoose");

const pendingAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  docsfile: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7 // auto delete after 7 days
  }
});

const PendingAdmin = mongoose.model("PendingAdmin", pendingAdminSchema);
module.exports={PendingAdmin}