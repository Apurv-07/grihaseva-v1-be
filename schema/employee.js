import mongoose from "mongoose";
const employeeSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      reuired: true,
      minlength: [3, "Issue must be at least 5 characters long"],
    },
    lname: {
      type: String,
      reuired: true,
      minlength: [3, "Issue must be at least 5 characters long"],
    },
    profileImage: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    adharId: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{12}$/,
    },
    specialized: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
      },
    ],
    publicId: {
      type: String,
    },
    currentOrder: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
    ordersCompleted: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timeStamp: true }
);

const employee = mongoose.model("Employee", employeeSchema);
export default employee;
