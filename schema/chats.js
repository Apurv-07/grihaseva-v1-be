import mongoose, { Schema } from "mongoose";
const chatSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    closed: {
        type: Boolean,
        default: false,
    },
    conversation: [{
        sender: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
})
const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;