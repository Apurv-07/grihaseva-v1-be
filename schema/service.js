import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 4
    }
})

const serviceModal=new mongoose.model('Service', serviceSchema);
export default serviceModal;