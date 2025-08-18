import { Router } from "express";
import { createEmployee, deleteEmployee, deleteProfileImage, getAllEmployees, updateEmployeeDetails } from "../contollers/employeeController.js";
import authProtector from "../middlewares/authProtector.js";
import { deleteCategory } from "../contollers/categoryController.js";
const empRoute=Router();

empRoute.route("/").get(getAllEmployees)

empRoute.route("/createNew").post(authProtector, createEmployee)

empRoute.route("/updateEmp/:empId").put(authProtector, updateEmployeeDetails)

empRoute.route("/deleteEmp/:empId").delete(authProtector, deleteEmployee)

empRoute.route("/deleteImage/:empId").delete(authProtector, deleteProfileImage)

export default empRoute