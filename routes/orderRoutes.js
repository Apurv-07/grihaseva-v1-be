import { Router } from "express"
import { changeOrderStatus, createOrder, deleteOrder, getAllOrders, getUsersOrderList, unAssignOrder, updateOrderDetails } from "../contollers/orderController.js";
import authProtector from "../middlewares/authProtector.js";
const orderRouter=Router();

orderRouter.route("/").get(authProtector, getAllOrders)

orderRouter.route("/getOrdersForUser").get(getUsersOrderList)

orderRouter.route("/createOrder").post(createOrder)

orderRouter.route("/updateOrder").put(authProtector, changeOrderStatus)

orderRouter.route("/deleteOrder/:id").delete(authProtector, deleteOrder)

orderRouter.route('/updateOrderDetails/:id').put(authProtector, updateOrderDetails)

orderRouter.route('/unAssignOrder/:id').put(authProtector, unAssignOrder)

export default orderRouter