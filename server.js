import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import PromoRouter from "./routes/promoRoute.js";

//app config
const app = express();
const port = 4000;

dotenv.config({ path: ".env.local" });
app.use((req, _res, next) => {
  console.log(`[Global Log] ${req.method} ${req.url}`);
  next();
});

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://nivala-food-ordering-admin.onrender.com",
      "https://nivala-food-ordering-frontend.onrender.com",
    ],
    credentials: true,
  }),
);

//DB config
connectDB();

//EndPoints
app.use("/api/food", foodRouter);
app.use("/api/auth", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/promo", PromoRouter);
const __dirname = path.resolve();
app.use("/images", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend Server is Awake" });
});

//listen with callback function
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
