import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

//add food item
const addFood = async (req, res) => {
  // Initialize req.body if undefined
  if (!req.body) {
    req.body = {};
  }

  // Original price
  const originalPrice = req.body.price || 0;
  // Discount Amount

  const discountAmount = req.body.discount || 0;

  const foodData = {
    name: req.body.name,
    description: req.body.description,
    price: originalPrice,
    image: req.body.image,
    category: req.body.category,
    serve: req.body.serve,
    type: req.body.type,
    userId: req.body.userId,
  };

  // Calculate the final price
  const calculatedStrikePrice = originalPrice - discountAmount;
  if (req.body.discount !== undefined && req.body.discount !== null) {
    foodData.discount = Number(req.body.discount);
    foodData.strike_price = calculatedStrikePrice;
  }

  const food = new foodModel(foodData);

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
    console.error(error);
    res.json({ success: false, message: "Failed to add item" });
  }
};;

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

    const food = await foodModel.find({
      _id: id,
      // userId: req.body.userId,
    });
    console.log("FOOD", id);
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
    console.error(error);
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
    const { search } = req.query;

    // Initialize req.body if undefined
    if (!req.body) {
      req.body = {};
    }

    // Get the user's linked adminId
    const user = await userModel.findById(req.body.userId);
    let adminIdToUse = req.body.userId;

    // If user has adminId linked, use that admin's products
    if (user && user.adminId) {
      adminIdToUse = user.adminId;
    }

    // Build query with userId
    let query = { userId: adminIdToUse };

    // Add search filter (search by name OR description)
    if (search) {
      query = {
        userId: adminIdToUse,
        $or: [
          { name: { $regex: search, $options: "i" } },
          // { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const food = await foodModel.find(query);
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

//Get related products by category
const getRelatedFood = async (req, res) => {
  try {
    const { category, productId } = req.query;
    const userId = req.body.userId;

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category required" });
    }

    // Get the user's linked adminId
    const user = await userModel.findById(req.body.userId);
    let adminIdToUse = req.body.userId;

    // If user has adminId linked, use that admin's products
    if (user && user.adminId) {
      adminIdToUse = user.adminId;
    }
    // Find products with same category, exclude current product
    const query = {
      category: category,
      userId: adminIdToUse,
    };

    if (productId) {
      query._id = { $ne: productId };
    }

    const food = await foodModel.find(query);
    if (food) {
      return res.status(200).json({
        success: true,
        message: "Related product retrieved successfully.",
        data: food,
      });
    }
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "No related item found",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to fetch related products" });
  }
};

export { addFood, listFood, removeFood, updateFood, getFood, getRelatedFood };
