import { TokenType } from "../Common/Enums/token.enum.js";
import { badRequestException, unAuthorizedException } from "../Common/Response/response.js";
import { decodeToken, getSignature, verifyToken } from "../Common/Security/token.js";
import * as DBRepo from '../DB/db.repository.js';
import UserModel from "../DB/Models/User.Model.js";


export function authentication (tokenTypeParam = TokenType.access){
    return async(req , res , next) => {
            const {authorization} = req.headers;
        
            const decodedToken = decodeToken(authorization);
            
            const [userRole , tokenType] = decodedToken.aud;
        
            if(tokenType != tokenTypeParam){
                return badRequestException('Invalid Token Type');
            }
        
            const {accessSignature , refreshSignature} = getSignature(userRole);
        
            const verifiedToken = verifyToken({
                token : authorization ,
                signature : 
                tokenTypeParam == TokenType.access ? accessSignature : refreshSignature
                ,
            });
        
            const user = await DBRepo.findById({
                model : UserModel, 
                id : verifiedToken.sub,
            });
        
            if(!user){
                return unAuthorizedException('Account not found , signup again');
            };
            req.user = user;
            next();
    }
}