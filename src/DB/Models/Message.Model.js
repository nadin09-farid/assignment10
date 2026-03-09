import mongoose from "mongoose";
import { type } from "node:os";

const messageSchema = new mongoose.Schema(
    {
        content : {
            type : String, 
            required : true,
        },
        senderId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        },
        recieverId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
        },
    },
    {
        timestamps : true,
    },
);

const MessagaModel = mongoose.model("Message" , messageSchema);
export default MessagaModel;