import mongoose, { Mongoose } from "mongoose";

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, "email not valid"],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Phone number must be 10 digits"],
  },
  issue: {
    type: String,
    required: [true, "Issue description is required"],
    trim: true,
    minlength: [5, "Issue must be at least 5 characters long"],
  },
  serviceCategory: {
    ref: "Category",
    type: mongoose.Schema.Types.ObjectId,
  },
  bookTime: {
    type: Date,
    default: Date.now,
    required: [true, "Booking time is required"],
  },
  deliveryTime: {
    type: Date,
    required: false,
    validate: {
      validator: function (v) {
        if (!v) return true;
        const date = new Date(v);
        return !isNaN(date) && date > this.bookTime;
      },
      message: "Delivery time must be a valid date after booking time",
    },
  },
  status: {
    type: String,
    enum: ["Pending", "Progress", "Completed", "Cancelled"],
    default: "Pending",
  },
  amount: {
    type: mongoose.Schema.ObjectId,
    ref: "Billing",
  },
  addressedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "Employee",
  },
}, { timeStamp: true });

const order = mongoose.model("Order", orderSchema);
export default order;
