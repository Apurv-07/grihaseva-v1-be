import e from "express";
import mongoose from "mongoose";

const complaintsSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "User name is required"],
    },
    contactNumber: {
        type: String,
        required: [true, "Contact number is required"],
    },
    issue: {
        type: String,
        required: [true, "Issue description is required"],
        trim: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    status: {
        type: String,
        enum: ["Open", "Closed"]
    },
}, {timestamps: true})

const Complaints = mongoose.model("Complaints", complaintsSchema);
export default Complaints;