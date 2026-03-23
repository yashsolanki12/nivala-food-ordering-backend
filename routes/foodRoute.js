import express from "express";
import {
  addFood,
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

export default foodRouter;
