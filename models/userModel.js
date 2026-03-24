import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, default: "user" },
    user: { type: mongoose.Schema.Types.ObjectId },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  { minimize: false, timestamps: true },
);

const userModel = mongoose.models.user || mongoose.model("users", userSchema);

export default userModel;
