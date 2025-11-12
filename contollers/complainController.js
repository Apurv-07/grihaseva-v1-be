import Complaints from "../schema/complaints.js";

export const raiseComplaint =async (req, res)=>{
    const {userName, contactNumber, issue, orderId}=req.body;
    if(!userName || !contactNumber || !issue){
        return res.status(400).json({message: "Please enter all required fields"})
    }
    try {
        const orderExists=await order.find({id:orderId});
        console.log("Order exists", orderExists)
        const newComplaint=new Complaints({
            userName,
            contactNumber,
            issue,
            order,
            status: "Open"
        });
        await newComplaint.save();
        return res.status(201).json({message: "Complaint raised successfully"})
    }catch (err){
        return res.status(500).json({message: "Something went wrong"})
    }
}

export const getAllComplaints=async (req, res)=>{
}

export const updateComplaintStatus=async (req, res)=>{
}