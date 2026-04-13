import mongoose from "mongoose";
import wishListModel from "../models/wishList.js";

// Add to wishlist
export const addWishList = async (req, res) => {
  try {
    let { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ success: false, message: "Fill up wish list data." });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id format." });
    }

    let productsToAdd = Array.isArray(productId) ? productId : [productId];

    for (const pid of productsToAdd) {
      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid id format." });
      }
    }

    let wishList = await wishListModel.findOne({ userId });
    if (!wishList) {
      wishList = new wishListModel({ userId, products: productsToAdd });
    } else {
      for (const pid of productsToAdd) {
        if (!wishList.products.includes(pid)) {
          wishList.products.push(pid);
        }
      }
    }
    const response = await wishList.save();
    if (response) {
      res
        .status(201)
        .json({ success: true, message: "Added to wishlist.", data: response });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add wish list",
      data: error.message,
    });
  }
};

// List of wishlist
export const getWishList = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id format." });
    }
    const wishList = await wishListModel
      .findOne({ userId: userId })
      .populate("products");
    if (!wishList) {
      return res.status(200).json({
        success: true,
        message: "Wishlist retrieved successfully.",
        data: [],
      });
    }
    if (wishList) {
      return res.status(200).json({
        success: true,
        message: "Wishlist retrieved successfully.",
        data: wishList.products,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get wish list",
      data: error.message,
    });
  }
};

// Delete wishlist
export const deleteWishList = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id format." });
    }

    let productsToRemove = Array.isArray(productId) ? productId : [productId];

    for (const pid of productsToRemove) {
      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid id format." });
      }
    }

    const wishList = await wishListModel.findOne({ userId });
    if (!wishList) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found." });
    }

    const existingProducts = wishList.products.filter(p => 
      productsToRemove.includes(p.toString())
    );

    if (existingProducts.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found in wishlist." });
    }

    const updateWishList = await wishListModel.findOneAndUpdate(
      { userId },
      { $pull: { products: { $in: productsToRemove } } },
      { returnDocument: 'after' },
    ).populate("products");

    return res
      .status(200)
      .json({
        success: true,
        message: "Wishlist item removed.",
        data: updateWishList.products,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete wish list",
      data: error.message,
    });
  }
};
