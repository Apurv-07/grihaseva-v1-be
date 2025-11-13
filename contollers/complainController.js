import Complaints from "../schema/complaints.js";
import order from "../schema/order.js";

export const raiseComplaint =async (req, res)=>{
    const {userName, contactNumber, issue, orderId}=req.body;
    if(!issue || !orderId){
        return res.status(400).json({message: "Please enter the issue and order id"})
    }
    try {
        const orderExists=await order.findOne({_id:orderId});
        const complaintExists=await Complaints.findOne({order: orderId, status: "Open"});
        if(complaintExists){
            return res.status(400).json({message: "An open complaint already exists for this order"})
        }
        if(orderId && !orderExists) {
            return res.status(404).json({message: "Order not found"})
        }
        const complainData={
            userName: userName || orderExists.name,
            contactNumber: contactNumber || orderExists.phone,
            issue,
            order: orderId,
            status: "Open"
        }
        const newComplaint=new Complaints(complainData);
        await newComplaint.save();
        return res.status(201).json({message: "Complaint raised successfully"})
    }catch (err){
        return res.status(500).json({message: "Something went wrong"})
    }
}

export const getAllComplaints=async (req, res)=>{4
    try {
        const complaints=await Complaints.find().populate('order');
        return res.status(200).json({success: true, data:complaints})
    }catch (err){
        return res.status(500).json({message: "Something went wrong"})
    }
}

export const updateComplaintStatus=async (req, res)=>{
}