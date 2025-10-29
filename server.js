import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import orderRouter from "./routes/orderRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import empRoute from "./routes/employeeRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import cors from "cors";
import { getCloudinarySignature } from "./utils/fileUpload.js";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000","https://newrepo-grihseva-fe.vercel.app/"],
    credentials: true,
  })
);

app.use("/api/order", orderRouter);
app.use("/api/category", categoryRouter);
app.use("/api/employee", empRoute);
app.use("/api/admin", adminRouter);
app.get("/api/imageSignature", getCloudinarySignature)

app.listen(process.env.PORT, async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_URL);
    console.log("Server has been running");
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
});
