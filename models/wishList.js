import mongoose from "mongoose";

const wishListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "food" }],
});

const wishListModel = mongoose.model("wishlist", wishListSchema);
export default wishListModel;
