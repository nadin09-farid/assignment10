import { GenderEnum } from "../Common/Enums/user.enum.js";
import { badRequestException } from "../Common/Response/response.js";
import Joi from "joi";




export function validation (schema) {
    return (req , res , next) => {
        const validationErrors = [];

        for(const schemaKey of Object.keys(schema)){

// 3amlna validation 
                        //              schema[body] ----- request bta3 this schema key
            const validateResult = schema[schemaKey].validate(req[schemaKey] , {
            abortEarly : false,
        });

        req["v" + schemaKey] = validateResult.value;

        if (validateResult.error?.details.length > 0){
            validationErrors.push(validateResult.error);
        }

        }

        if(validationErrors.length > 0){
            return badRequestException("Validation Err" , validationErrors);
        }    
        next();
    };
};

export const CommonFieldValidation = {
        userName : Joi
        .string()
        .pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/)
    ),
        email : Joi
        .string()
        .email()
        .pattern(
            new RegExp(/^\w{3,25}@(gmail|yahoo|outlook|icloud)(.com|.net|.co|.eg){1,4}$/)
    ),
        password : Joi
        .string()
        .pattern(
            new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,16}/)
    ),
        phone : Joi
        .string()
        .pattern(
            new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)
        )
        
        ,
        DOB : Joi.date(),
        gender: Joi.string().valid(...Object.values(GenderEnum)),
}