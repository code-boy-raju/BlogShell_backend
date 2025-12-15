

const { claudynaryUpload } = require("../config/cloudynary.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/authModel.js");
const { sendEmail } = require("../services/emailservice.js");
require("dotenv").config();
const fs = require("fs");

//AUTHOR SIGNUP
const authorSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const Password = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: Password,
      role: "author",
    });

    await sendEmail(
      email,
      "Registration successful.",
      `<h2>Welcome ${name}!</h2>
       `
    );

    res.status(200).json({
      message: "Registration successful.",
      userId: newUser._id
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong in signupDetails: " + error });
  }
};

// ADMIN SIGNUP 
const adminSignup = async (req, res) => {
  const { name, email, password } = req.body;
  const uploadfile = await claudynaryUpload(req.file.path);
  console.log(uploadfile);

  try {
    fs.unlinkSync(req.file.path);

    if (!name || !email || !password || !uploadfile) {
      return res.status(400).json({ message: "All fields required" });
    }

    const check = await userModel.findOne({ email });
    if (check) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const pendingAdmin = {
      name,
      email,
      password: hashPass,
      role: "admin",
      adminApplication: {
        applicationStatus: "pending",
        docsfile: uploadfile ? uploadfile.secure_url : null
      },
    };

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const approveUrl = `http://localhost:5000/user/verifyadmin?status=approve&token=${token}`;
    const rejectUrl = `http://localhost:5000/user/verifyadmin?status=reject&token=${token}`;

    await sendEmail(
      process.env.ADMIN_MAIL,
      "Admin Approval Request",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #191818ff; text-align: center;">Approve or Reject Admin for BlogShell</h2>
        <p><strong>${name}</strong> has applied to become an instructor.</p>
        <p><strong>Email:</strong> ${email}<br/><strong>Password:</strong> ${password}</p>
        <p><a href="${uploadfile.secure_url}" style="color: #11bff4ff;" target="_blank">📎 View Identity Document</a></p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${approveUrl}" style="padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">✅ Approve</a>
          <a href="${rejectUrl}" style="padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">❌ Reject</a>
        </div>
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">This is an automated email. Please do not reply.</p>
      </div>`
    );

    await userModel.create(pendingAdmin);
    res.status(200).json({
      message: " Email approval sent to superadmin. In case of approval, you will get a success email."
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Something went wrong in signupDetails", error: error });
  }
};

//  VERIFY ADMIN APPROVAL 
const verifyAdmin = async (req, res) => {
  const { status, token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    if (!email) return res.status(400).send(" Invalid token");

    if (status === "approve") {
      await userModel.findOneAndUpdate(
        { email },
        { "adminApplication.applicationStatus": "approved" },
        { new: true }
      );

      await sendEmail(
        email,
        "Admin Approval Accepted",
        `<h2> Your Admin account has been approved for BlogShell!</h2>
         <p>You can now log in to your Admin dashboard.</p>`
      );

      return res.send(`<h2> Admin approved successfully!</h2>
                       <p>An email has been sent to the admin notifying them.</p>`);
    }

    if (status === "reject") {
      const user = await userModel.findOne({ email });
      if (user) {
        await userModel.findOneAndDelete({ email });

        await sendEmail(
          email,
          "Admin Approval Rejected",
          `<h2> Sorry, your Admin application has been rejected.</h2>
           <p>You may reapply later.</p>`
        );
      }

      return res.send(`<h2 Admin rejected successfully!</h2>
                       <p>An email has been sent to the applicant.</p>`);
    }

    return res.status(400).send(" Invalid status. Use approve or reject.");

  } catch (error) {
    console.log(error);
    return res.status(400).send(" Invalid or expired token");
  }
};

// ------------------- LOGIN -----------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Sign JWT with user id, role, and permissions
    const tokenPayload = {
      id: user._id,
      role: user.role,
      permissions: user.permissions || {},
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || {},
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };

// FORGOT PASSWORD (JWT BASED)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await userModel.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  // Create RESET TOKEN (short lived)
  const resetToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail(
    email,
    "Reset Your Password",
    `<p>Click below to reset your password</p>
     <a href="${resetUrl}">Reset Password</a>
     <p>Token valid for 15 minutes</p>`
  );

  res.json({ message: "Reset link sent to your email" });
};

// RESET PASSWORDS
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) return res.status(400).json({ message: "New password required" });

  try {
    // Verify Reset Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};


module.exports = { authorSignup, adminSignup, verifyAdmin, login ,forgotPassword,resetPassword };
