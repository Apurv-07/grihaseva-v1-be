import { Router } from "express"
import { createCategory, deleteCategory, deleteCategoryImage, getAllCategories, getPopularCategories, updateCategory } from "../contollers/categoryController.js";
import authProtector from "../middlewares/authProtector.js";

const categoryRouter=Router();

categoryRouter.route("/").get(getAllCategories)
categoryRouter.route("/popular").get(getPopularCategories)
categoryRouter.route("/createCategory").post(authProtector, createCategory)
categoryRouter.route("/deleteCategory/:id").delete(authProtector, deleteCategory)
categoryRouter.route("/deleteCategoryImage/:id").delete(authProtector, deleteCategoryImage)
categoryRouter.route("/updateCategory/:id").put(authProtector, updateCategory)

export default categoryRouter