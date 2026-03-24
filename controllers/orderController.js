import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

const placeOrder = async (req, res) => {
  try {
    // Initialize req.body if undefined
    if (!req.body) {
      req.body = {};
    }
    // Get all unique userIds from the food items in the order
    const itemIds = req.body.items.map((item) => item._id);
    const foodItems = await foodModel.find({ _id: { $in: itemIds } });
    const userIds = [
      ...new Set(foodItems.map((item) => item.userId.toString())),
    ];

    const newOrder = new orderModel({
      orderId: req.body.userId + Date.now().toString(),
      userId: req.body.userId,
      userIds: userIds,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while placing the order",
      error: error.message,
    });
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    return res.status(200).json({
      success: true,
      message: "User order fetch successfully",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({
      userIds: { $in: [req.body.userId] },
    });
    return res.status(200).json({
      success: true,
      message: "Order list retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while listing orders",
      error: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    // Find by custom orderId field instead of MongoDB _id, and filter by adminIds
    await orderModel.findOneAndUpdate(
      { orderId: req.body.orderId, userIds: { $in: [req.body.userId] } },
      { status: req.body.status },
    );
    return res.status(200).json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while Updating Status",
      error: error.message,
    });
  }
};

export { placeOrder, userOrders, listOrders, updateStatus };
