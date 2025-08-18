import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
  },
  authorized: {
    type: Boolean,
    default: false
  }
});
const admin=mongoose.model("Admin", adminSchema)
export default admin
