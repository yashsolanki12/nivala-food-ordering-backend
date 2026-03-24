import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

//add food item
const addFood = async (req, res) => {
  // Initialize req.body if undefined
  if (!req.body) {
    req.body = {};
  }
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: req.body.image,
    category: req.body.category,
    serve: req.body.serve,
    type: req.body.type,
    userId: req.body.userId,
  });

  console.log(food);
  try {
    const foodList = await food.save();
    if (foodList) {
      res
        .status(200)
        .json({ success: true, message: "Product added successfully." });
    }
    if (!foodList) {
      res.status(200).json({
        success: false,
        message: "No item found",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to add item" });
  }
};

// Update food item
const updateFood = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }
    if (!name || !description || !price || !image || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill up all data.",
      });
    }
    const payload = {
      name: name,
      description: description,
      price: price,
      image: image,
      category: category,
    };
    const updateFood = await foodModel.findOneAndUpdate(
      { _id: id, userId: req.body.userId },
      payload,
      { new: true },
    );
    if (updateFood) {
      return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: updateFood,
      });
    }
    if (!updateFood) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to update it.",
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// Detail Food item
const getFood = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const food = await foodModel.findOne({
      _id: id,
      userId: req.body.userId,
    });
    if (food) {
      return res.status(200).json({
        success: true,
        message: "Product fetched successfully.",
        data: food,
      });
    }
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "No item found.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching get api.",
      error: error.message,
    });
  }
};

//Getting Food List
const listFood = async (req, res) => {
  try {
    console.log("food list req", req.body);
    // Initialize req.body if undefined
    if (!req.body) {
      req.body = {};
    }

    // Get the user's linked adminId
    const user = await userModel.findById(req.body.userId);
    console.log("fetched user:", user);
    let adminIdToUse = req.body.userId;

    // If user has adminId linked, use that admin's products
    if (user && user.adminId) {
      adminIdToUse = user.adminId;
      console.log("user has adminId, using:", adminIdToUse);
    } else {
      console.log("user has no adminId, using own userId:", adminIdToUse);
    }

    const food = await foodModel.find({ userId: adminIdToUse });
    console.log("food items found:", food.length);
    if (food) {
      return res.status(200).json({
        success: true,
        message: "Product list fetched successfully",
        data: food,
      });
    }
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "No item found." });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to fetch list." });
  }
};

//Remove Food Item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findOne({
      _id: req.body.id,
      userId: req.body.userId,
    });
    if (food) {
      await foodModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Product deleted successfully." });
    }
    if (!food) {
      res.status(404).json({
        success: false,
        message: "Cannot find the item to delete or you don't have permission",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to delete item" });
  }
};

export { addFood, listFood, removeFood, updateFood, getFood };
