import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import mongoose from "mongoose";

const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;

    // Handle comma-separated itemIds
    let itemIds = req.body.itemId;
    if (typeof itemIds === "string" && itemIds.includes(",")) {
      itemIds = itemIds.split(",").map((id) => id.trim());
    } else {
      itemIds = [itemIds];
    }

    // Add each item to cart
    itemIds.forEach((itemId) => {
      if (!cartData[itemId]) {
        cartData[itemId] = 1;
      } else {
        cartData[itemId] += 1;
      }
    });

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    return res
      .status(200)
      .json({ success: true, message: "Item Added to Cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;

    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });

    return res
      .status(200)
      .json({ success: true, message: "Item Removed from Cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;

    // Get all item IDs from cartData and expand any comma-separated keys
    let itemIds = [];
    Object.keys(cartData).forEach((key) => {
      if (key.includes(",")) {
        // Split comma-separated keys and add each
        const splitKeys = key.split(",").map((id) => id.trim());
        itemIds.push(...splitKeys);
      } else {
        itemIds.push(key);
      }
    });

    // Convert to ObjectIds - handle both string and ObjectId formats
    const objectIdArray = itemIds
      .filter((id) => id) // filter empty values
      .map((id) => {
        // If it's already a valid ObjectId string, convert it
        if (typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) {
          return new mongoose.Types.ObjectId(id);
        }
        // If it's already an ObjectId, use it directly
        if (id instanceof mongoose.Types.ObjectId) {
          return id;
        }
        return null;
      })
      .filter((id) => id !== null);

    // Fetch all food items from foodModel
    const foodItems = await foodModel.find({ _id: { $in: objectIdArray } });

    // Map food items with their quantities from cartData
    const cartWithProductData = foodItems.map((item) => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      serve: item.serve,
      type: item.type,
      quantity: cartData[item._id.toString()] || 0,
    }));

    return res
      .status(200)
      .json({ success: true, cartData: cartWithProductData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

const deleteCart = async (req, res) => {
  try {
    // Clear the entire cart for the user
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    return res
      .status(200)
      .json({ success: true, message: "Cart Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

export { addToCart, removeFromCart, getCart, deleteCart };
