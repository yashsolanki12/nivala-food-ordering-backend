import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const loginUser = async (req, res) => {
  const { email, password } = req.body;
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
    console.log(error);
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
  console.log("req", req.body);
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
    console.log("salt", salt);
    console.log("hashed Password", hashedPassword);
    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: role || "user",
    });

    const user = await newUser.save();
    console.log("User", user);
    const token = jwtToken(user.name, user.email, user._id, user.role);
    console.log("Token generated successfully");
    if (user) {
      return res
        .status(201)
        .json({ success: true, message: "User Registered", token, data: user });
    }
  } catch (error) {
    console.log("Registration error:", error);
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

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const listUser = async (_req, res) => {
  try {
    const user = await userModel.find({});
    if (user) {
      res.status(201).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    }
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { loginUser, registerUser, loginadmin, listUser };
