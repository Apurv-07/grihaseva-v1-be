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
  parentService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
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
  address: {
    addressLine1: {
      type: String,
      maxlength: 40,
      required: false,
    },
    addressLine2: {
      type: String,
      maxlength: 40,
      required: false,
    },
    landmark: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: false,
    },
    pinCode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pin code must be 6 digits"],
    }
  }
}, { timestamps: true });

const order = mongoose.model("Order", orderSchema);
export default order;
