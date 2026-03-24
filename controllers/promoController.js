import promoModel from "../models/promoModel.js";
import userModel from "../models/userModel.js";

const addpromo = async (req, res) => {
  try {
    // Initialize req.body if undefined
    if (!req.body) {
      req.body = {};
    }
    const newpromo = promoModel({
      promoCode: req.body.promoCode,
      discount: req.body.discount,
      expiryDate: req.body.expiryDate,
      isActive: req.body.isActive,
      createdAt: new Date(),
      discountType: req.body.discountType,
      userId: req.body.userId,
    });

    await newpromo.save();

    res.status(201).json({
      success: true,
      message: "Promo added successfully",
      data: newpromo,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Promo code already in use." });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to add promo",
      error: error.message,
    });
  }
};

const getallpromo = async (req, res) => {
  try {
    // Initialize req.body if undefined
    if (!req.body) {
      req.body = {};
    }

    // Get the user's linked adminId
    const user = await userModel.findById(req.body.userId);
    let adminIdToUse = req.body.userId;

    // If user has adminId linked, use that admin's promo codes
    if (user && user.adminId) {
      adminIdToUse = user.adminId;
    }

    const promos = await promoModel.find({ userId: adminIdToUse });
    return res.status(200).json({ success: true, data: promos });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get promo",
      error: error.message,
    });
  }
};

const updatepromo = async (req, res) => {
  try {
    const { promoId, promoCode, discount, expiryDate, isActive, discountType } =
      req.body;

    const existing = await promoModel.findOne({
      promoCode: req.body.promoCode,
      adminId: req.body.userId,
    });

    if (existing && existing._id.toString() !== promoId) {
      return res
        .status(409)
        .json({ success: false, message: "Promo code already in use." });
    }

    const updatedPromo = await promoModel.findOneAndUpdate(
      { _id: promoId, userId: req.body.userId },
      {
        promoCode,
        discount,
        expiryDate,
        isActive,
        discountType,
      },
      { new: true },
    );

    if (!updatedPromo) {
      return res.status(404).json({
        success: false,
        message: "Promo not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promo updated successfully",
      data: updatedPromo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update promo",
      error: error.message,
    });
  }
};

const deletepromo = async (req, res) => {
  try {
    const promo = await promoModel.findOneAndDelete({
      promoCode: req.body.promoCode,
      userId: req.body.userId,
    });
    if (promo) {
      return res
        .status(200)
        .json({ success: true, message: "Promo deleted successfully" });
    }
    if (!promo) {
      return res
        .status(404)
        .json({ success: false, message: "Promo code not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete promocode",
      error: error.message,
    });
  }
};

const checkpromoandgetdetails = async (req, res) => {
  try {
    const promo = await promoModel.findOne({ promoCode: req.body.promoCode });
    if (promo) {
      return res.status(200).json({ success: true, data: promo });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Promo not found" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get promo",
      error: error.message,
    });
  }
};

export {
  addpromo,
  getallpromo,
  updatepromo,
  deletepromo,
  checkpromoandgetdetails,
};
