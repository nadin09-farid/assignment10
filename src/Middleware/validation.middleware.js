import { badRequestException } from "../Common/Response/response.js";

export function validation (schema) {
    return (req , res , next) => {
        const validateResult = schema.validate(req.body , {
            abortEarly : false,
        });

        if (validateResult.error?.details.length > 0){
            throw badRequestException(
                validateResult.error.message,
                validateResult.error,
            );
        }
        next();
    };
}