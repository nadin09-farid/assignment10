import { badRequestException, notFoundException } from '../../Common/Response/response.js';
import * as DBrepo from '../../DB/db.repository.js';
import MessagaModel from '../../DB/Models/Message.Model.js';
import UserModel from '../../DB/Models/User.Model.js';


export async function sendMessage(recieverId , content , filesData , senderId) {
    const reciever = await DBrepo.findById({
        model : UserModel,
        id : recieverId
    });

    if (!reciever){
        return badRequestException('Reciever Not Found .. ');
    };

    await DBrepo.create({
        model : MessagaModel,
        insertedData : {
            content , 
            attachments : filesData.map((file) => file.finalPath) , 
            senderId , 
            recieverId,
        },
    });
    
};

export async function getMsgByID(userData , messageId) {
    const msg = await DBrepo.findOne({
        model : MessagaModel , 
        filters : {
            _id : messageId , 
            recieverId : userData._id,
        },
        select: "-senderId",
    });

    if (!msg){
        return notFoundException('Invalid Msg ID');
    }
    return msg;
};

export async function getAllMsgs(userId) {
    const msg = await DBrepo.find({
        model : MessagaModel , 
        filters : {
            $or : [{recieverId : userId}, {senderId : userId}, ]
        },
        select: "-senderId",
    });

    if (!msg.length){
        return notFoundException('No Msgs Found');
    }
    return msg;
    
};


export async function removeMsg(userData , messageId) {
    const msg = await DBrepo.deleteOne({
        model : MessagaModel , 
        filter : {
            _id : messageId, 
            recieverId: userData._id,
        },
    });

    if (!msg.deletedCount){
        return notFoundException('No Msgs Found');
    }
    return msg;
    
};
