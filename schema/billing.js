import mongoose from "mongoose";

const billingSchema= mongoose.Schema({
    description : [{
        quantity: {
            type: Number,
            default: 1
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },  
    total: {
        type: Number,
        required: true,
        default: 0
    }
})

const billing = mongoose.model("Billing", billingSchema)
export default billing