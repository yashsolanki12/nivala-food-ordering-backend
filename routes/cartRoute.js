import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
  deleteCart,
} from "../controllers/CartController.js";
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.delete("/remove", authMiddleware, removeFromCart);
cartRouter.get("/get", authMiddleware, getCart);
cartRouter.delete("/delete", authMiddleware, deleteCart);

export default cartRouter;
