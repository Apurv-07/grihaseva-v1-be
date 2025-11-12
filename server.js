import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import orderRouter from "./routes/orderRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import empRoute from "./routes/employeeRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import chatRouter from "./routes/chatRouter.js";
import cors from "cors";
import { getCloudinarySignature } from "./utils/fileUpload.js";
import { loadLogic } from "./bot/botEngine.js";
import complainRouter from "./routes/complainRoutes.js";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000","https://newrepo-grihseva-fe-j8en.vercel.app"],
    credentials: true,
  })
);

app.use("/api/order", orderRouter);
app.use("/api/category", categoryRouter);
app.use("/api/employee", empRoute);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);
app.use("/api/complaints", complainRouter);
app.get("/api/imageSignature", getCloudinarySignature)

loadLogic(); 

app.listen(process.env.PORT, async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_URL);
    console.log("Server has been running");
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
});
