import Joi from "joi";
import { CommonFieldValidation } from "../../Middleware/validation.middleware.js";

export const sendMessageSchema = {
    body : Joi.object({}).keys({
        content : Joi.string().min(3).max(1000),
    }),
    params : Joi.object({}).keys({
        recieverId : CommonFieldValidation.id.required(), 
    }).required(),
};

export const getMessageByIdSchema = {
    params : Joi.object({}).keys({
        messageId : CommonFieldValidation.id.required(), 
    }).required(),
};


export const deleteMsgSchema = {
    params : Joi.object({}).keys({
        messageId : CommonFieldValidation.id.required(), 
    }).required(),
};