import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  addWishList,
  deleteWishList,
  getWishList,
} from "../controllers/wishListController.js";

const wishRouter = express.Router();

// Add to wishlist
wishRouter.post("/add", authMiddleware, addWishList);

// Get wishlist
wishRouter.get("/:userId", authMiddleware, getWishList);

// Delete wish-list
wishRouter.delete("/:userId/:productId", authMiddleware, deleteWishList);

export default wishRouter;
