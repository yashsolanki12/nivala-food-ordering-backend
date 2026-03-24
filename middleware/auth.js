import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Initialize req.body if undefined (for GET requests without body parser)
    if (!req.body) {
      req.body = {};
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, Login Again" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access token required",
        success: false,
      });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      console.error("JWT Verify Error:", verifyError.message);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    console.log("decodedToken:", decodedToken);

    // Get the user id from the decoded token - handle all possible field names
    const userId = decodedToken.id || decodedToken._id;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token - no user ID",
        success: false,
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    // // Check if user has admin role for protected routes
    // const isAdmin = user.role === "admin";

    // Set user info in both req.user and req.body for compatibility
    req.user = user;
    // Only set userId if not already provided in request (for operations on other users)
    if (!req.body.userId) {
      req.body.userId = user._id;
    }
    req.body.userRole = user.role;
    // req.body.isAdmin = isAdmin;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
