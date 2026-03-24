import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import mongoose from "mongoose";

const loginUser = async (req, res) => {
  const { email, password, user } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Please Register Before Logging In" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwtToken(user.name, user.email, user._id);
    return res
      .status(200)
      .json({ success: true, message: "User Logged In", token, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error });
  }
};

const jwtToken = (name, email, id, role) => {
  return jwt.sign({ name, email, id, role }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

const registerUser = async (req, res) => {
  const { name, password, email, role } = req.body;
  if (!name || !password || !email) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: role || "user",
      user: req.body.userId,
    });

    const user = await newUser.save();
    const token = jwtToken(user.name, user.email, user._id, user.role);
    if (user) {
      return res
        .status(201)
        .json({ success: true, message: "User Registered", token, data: user });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || error });
  }
};

const loginadmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const admin = await userModel.findOne({ email });

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (admin.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    if (admin) {
      res.status(200).json({
        success: true,
        message: "Admin login successfully",
        token,
        data: admin,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const listUser = async (req, res) => {
  try {
    const userNormal = await userModel.find({});
    if (userNormal) {
      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: userNormal,
      });
    }
    if (!userNormal) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Otherwise return all users (admin only) with user
    // console.log("BEFORE:::", req.body);
    // const user = await userModel.find({ user: req.body.userId });
    // console.log("THat request body", req.body);
    // console.log("USER LIST SHOWN", user);
    // if (user) {
    //   res.status(200).json({
    //     success: true,
    //     message: "User retrieved successfully",
    //     data: user,
    //   });
    // }
    // if (!user) {
    //   res.status(404).json({ success: false, message: "User not found" });
    // }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Detail user
const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id format.",
      });
    }
    const userDetail = await userModel.findById(id);
    if (userDetail) {
      return res.status(200).json({
        success: true,
        message: "User fetched successfully.",
        data: userDetail,
      });
    }
    if (!userDetail) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching get api of user.",
      error: error.message,
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id format.",
      });
    }
    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill up all data.",
      });
    }
    const payload = {
      name: name,
      role: role,
    };
    const user = await userModel.findByIdAndUpdate(id, payload, { new: true });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        data: user,
      });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the api of user.",
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id format.",
      });
    }
    const user = await userModel.findByIdAndDelete(id);
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
      });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user.",
      error: error.message,
    });
  }
};

// Link a user to an admin
const linkUserToAdmin = async (req, res) => {
  const { userId, adminId } = req.body;
  try {
    if (req.body.userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can link users to admins",
      });
    }

    if (!userId || !adminId) {
      return res.status(400).json({
        success: false,
        message: "userId and adminId are required",
      });
    }

    // Verify both IDs are valid
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(adminId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    // Verify the admin exists and has admin role
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID or not an admin.",
      });
    }

    // Link the user to the admin
    const user = await userModel.findByIdAndUpdate(
      userId,
      { adminId: adminId },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User linked to admin successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while linking user to admin.",
      error: error.message,
    });
  }
};

export {
  loginUser,
  registerUser,
  loginadmin,
  listUser,
  getUser,
  updateUser,
  deleteUser,
  linkUserToAdmin,
};
