import express from "express";
import {
  addFood,
  getFood,
  listFood,
  removeFood,
  updateFood,
} from "../controllers/foodController.js";
import authMiddleware from "../middleware/auth.js";

const foodRouter = express.Router();

foodRouter.post("/add", authMiddleware, addFood);
foodRouter.get("/list", authMiddleware, listFood);
foodRouter.delete("/remove", authMiddleware, removeFood);
foodRouter.put("/:id", authMiddleware, updateFood);
foodRouter.get("/:id", authMiddleware, getFood);

export default foodRouter;
