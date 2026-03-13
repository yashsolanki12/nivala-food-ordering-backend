import express from "express";
import { addpromo,getallpromo,updatepromo,deletepromo,checkpromoandgetdetails } from "../controllers/promoController.js";
import authMiddleware from "../middleware/auth.js";

const PromoRouter = express.Router();

PromoRouter.post("/add", authMiddleware,addpromo);
PromoRouter.get("/all", authMiddleware,getallpromo);
PromoRouter.put("/update", authMiddleware,updatepromo);
PromoRouter.delete("/delete", authMiddleware,deletepromo);
PromoRouter.post("/check", authMiddleware,checkpromoandgetdetails);

export default PromoRouter;
