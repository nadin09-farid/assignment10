import Joi from "joi"
import { CommonFieldValidation } from "../../Middleware/validation.middleware.js";

export const loginSchema = {
    body: Joi
    .object({})
    .keys({
    email : CommonFieldValidation.email.required(),
    password : CommonFieldValidation.password.required(),
})
.required(),
};

//3amla el schema object w edenaha keys key lel data bta3t el body w key lel query data
// 34an n3rf n access 3ala el schema bel keys deh fel validation middleware


export const signupSchema = {
    query : Joi.object({}).keys({
        ln: Joi.string().valid('ar' , 'en' , 'fr').required(),
    }),

    body : Joi
    .object({})
    .keys({
    userName : CommonFieldValidation.userName.required(),
    email : CommonFieldValidation.email.required(),
    password : CommonFieldValidation.password.required(),
    confirmPassword : Joi.string().valid(Joi.ref("password")).required(),
    phone : CommonFieldValidation.phone,
    DOB : CommonFieldValidation.DOB,
    gender: CommonFieldValidation.gender,
})
.required()
};