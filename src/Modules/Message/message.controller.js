import express from 'express';
import { allowedFileFormats, localUpload } from '../../Common/Multer/multer.config.js';
import { getAllMsgs, getMsgByID, removeMsg, sendMessage } from './message.service.js';
import { badRequestException, successResponse } from '../../Common/Response/response.js';
import { authentication } from '../../Middleware/authentication.middleware.js';
import { validation } from '../../Middleware/validation.middleware.js';
import { getMessageByIdSchema, sendMessageSchema } from './message.validation.js';


const messageRouter = express.Router();


messageRouter.post("/:recieverId" ,
    (req , res , next) => {
    const {authorization} = req.headers;
        if (authorization){
            return authentication()(req , res , next);
    }
    next();
    },
    localUpload({
        folderName : 'Messages',
        allowedFileFormat : [...allowedFileFormats.img , ...allowedFileFormats.video],
    }).array('msgAttachments' , 5),
    
    validation(sendMessageSchema),
    
    async (req , res) => {

        if (!req.body && !req.files){
            return badRequestException('Youu need to send at least content or file');
        }

        await sendMessage(
            req.params.recieverId , 
            req.body.content , 
            req.files,
            req.user?._id,
        );
        return successResponse({res , statusCode : 201 , data : 'Msg Sent'});
    },
);

messageRouter.get('/get-msg-by-id/:messageId'  , 
    authentication(),
    validation(getMessageByIdSchema),
    async(req , res) =>{
        const result = await getMsgByID(req.user , req.params.messageId);
        return successResponse({res  , data : result});
    },
);


messageRouter.get('/get-all-messages'  , 
    authentication(),
    async(req , res) =>{
        const result = await getAllMsgs(req.user._id);
        return successResponse({res  , data : result});
    },
);

messageRouter.delete('/:messageId'  , 
    authentication(),
    async(req , res) =>{
        await removeMsg(req.user, req.params.messageId);
        return successResponse({res  , data : 'Msg Deleted'});
    },
);

export default messageRouter;