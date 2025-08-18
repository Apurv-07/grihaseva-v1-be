import { Router } from "express";
import { createNewAdmin, login } from "../contollers/adminController.js";
import authProtector from "../middlewares/authProtector.js";
const adminRouter=Router();

adminRouter.route("/login").post(login)
adminRouter.route("/addAdmin").post(authProtector, createNewAdmin)

export default adminRouter