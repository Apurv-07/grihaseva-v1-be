import mongoose from "mongoose";
const categorySchema=new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
    },
    publicId: {
        type: String,
    },
    description: [
        {
            type: String,
        }
    ],
    priceDescription: [
        {
            type: String
        }
    ],
    startingFrom: {
        type: Number,
        required: true
    }
}, {timeStamp: true})

const category=mongoose.model("Category", categorySchema)
export default category;