import foodModel from "../models/foodModel.js";
import mongoose from "mongoose";

//add food item
const addFood = async (req, res) => {
  console.log(req.body);

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: req.body.image,
    category: req.body.category,
    serve: req.body.serve,
    type: req.body.type,
  });

  console.log(food);
  try {
    await food.save();
    res.json({ success: true, message: "Food item added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to add Food Item" });
  }
};

const updateFood = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format",
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
    const updateFood = await foodModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (updateFood) {
      return res.status(200).json({
        success: true,
        message: "Food item updated successfully.",
        data: updateFood,
      });
    }
    if (!updateFood) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
  } catch (error) {
    console.error(error);
  }
};
//Getting Food List
const listFood = async (req, res) => {
  try {
    const food = await foodModel.find({});
    res.json({ success: true, data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to fetch Food List" });
  }
};

//Remove Food Item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (food) {
      await foodModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Food Item Deleted Successfully" });
    }
    if (!food) {
      res.status(404).json({
        success: false,
        message: "Cannot find the food item to delete",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to delete Food" });
  }
};

export { addFood, listFood, removeFood, updateFood };
