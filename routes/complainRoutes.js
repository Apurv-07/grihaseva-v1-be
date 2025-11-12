import { Router } from "express";
import { getAllComplaints, raiseComplaint, updateComplaintStatus } from "../contollers/complainController.js";
const complainRouter = Router();

complainRouter.get("/", getAllComplaints);
complainRouter.put("/resolve", updateComplaintStatus);
complainRouter.post("/raise", raiseComplaint);

export default complainRouter;