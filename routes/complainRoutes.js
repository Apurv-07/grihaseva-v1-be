import { Router } from "express";
import { getAllComplaints, raiseComplaint, updateComplaintStatus } from "../contollers/complainController.js";
import authProtector from "../middlewares/authProtector.js";
const complainRouter = Router();

complainRouter.get("/", authProtector, getAllComplaints);
complainRouter.put("/resolve", authProtector, updateComplaintStatus);
complainRouter.post("/raise", raiseComplaint);

export default complainRouter;