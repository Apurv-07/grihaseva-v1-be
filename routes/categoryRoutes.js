import { Router } from "express"
import { addServiceCategory, createCategory, deleteCategory, deleteCategoryImage, deleteTheService, getAllCategories, getAllServices, getPopularCategories, updateCategory, updateService } from "../contollers/categoryController.js";
import authProtector from "../middlewares/authProtector.js";

const categoryRouter=Router();

categoryRouter.route("/").get(getAllCategories)
categoryRouter.route("/popular").get(getPopularCategories)
categoryRouter.route("/createCategory").post(authProtector, createCategory)
categoryRouter.route("/deleteCategory/:id").delete(authProtector, deleteCategory)
categoryRouter.route("/deleteCategoryImage/:id").delete(authProtector, deleteCategoryImage)
categoryRouter.route("/updateCategory/:id").put(authProtector, updateCategory)
categoryRouter.route("/addService").post(authProtector, addServiceCategory)
categoryRouter.route('/getAllServices').get(getAllServices)
categoryRouter.route('/updateService').put(authProtector, updateService)
categoryRouter.route('/deleteService').delete(authProtector, deleteTheService)

export default categoryRouter