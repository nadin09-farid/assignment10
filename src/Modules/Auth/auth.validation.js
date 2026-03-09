import Joi from "joi"

export const loginSchema = Joi.object({}).keys({
    userName : Joi.string().alphanum().uppercase().messages({
        "string.alphanum" : "userName cannot contain special chars",
        "any.required" : "userName required",
    }),
    email : Joi.string().email().trim(),
    password : Joi.string().min(6).max(18).required(),
})
.xor("userName" , "email")
.messages({
    "object.missing" : "You must enter one those : 'userName  , email ' ",
})
.required();

export const signupSchema = Joi.object({}).keys({
    userName : Joi.string().alphanum().uppercase().required().messages({
        "string.alphanum" : "userName cannot contain special chars",
        "any.required" : "userName required",
    }),
    email : Joi.string().email().trim().required(),
    password : Joi.string().min(6).max(18).required(),
    confirmPassword : Joi.string().valid(Joi.ref("password")).required(),
    phone : Joi.string(),
    DOB : Joi.date(),
    gender: Joi.string().valid('male' , 'female'),
})
.required();