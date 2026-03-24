import express from "express";
import {
  loginUser,
  registerUser,
  loginadmin,
  listUser,
  getUser,
  updateUser,
  deleteUser,
  linkUserToAdmin,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/login-admin", loginadmin);
userRouter.get("/users", authMiddleware, listUser);
userRouter.get("/:id", authMiddleware, getUser);
userRouter.put("/:id", authMiddleware, updateUser);
userRouter.delete("/:id", authMiddleware, deleteUser);
userRouter.post("/link-to-admin", authMiddleware, linkUserToAdmin);

export default userRouter;
