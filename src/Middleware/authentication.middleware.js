import { TokenType } from "../Common/Enums/token.enum.js";
import { badRequestException, unAuthorizedException } from "../Common/Response/response.js";
import { decodeToken, getSignature, verifyToken } from "../Common/Security/token.js";
import * as DBRepo from '../DB/db.repository.js';
import UserModel from "../DB/Models/User.Model.js";
import * as redisMethods from '../DB/redis.service.js';

export function authentication (tokenTypeParam = TokenType.access){
    return async(req , res , next) => {

            const {authorization} = req.headers;
        
            const [bearerKey , token] = authorization.split(" ");
            
            if(bearerKey != "Bearer"){
                return badRequestException('Invalid bearer key')
            };
            
            const decodedToken = decodeToken(token);
            
            const [userRole , tokenType] = decodedToken.aud;
        
            if(tokenType != tokenTypeParam){
                return badRequestException('Invalid Token Type');
            }
        
            const {accessSignature , refreshSignature} = getSignature(userRole);
        
            const verifiedToken = verifyToken({
                token : token ,
                signature : 
                TokenType.refresh == tokenType ? refreshSignature : accessSignature,
                
            });
// bn check lw la2ena aandna fel tokenmodel doc bel id bta3 el token elli galy fa hna baa bn stop w n2oolo 
// en m7tag l login tany yaani token gdeeda
            if(
                await redisMethods.get(
                    redisMethods.blackListTokenKey({
                        userId : verifiedToken.sub,
                        tokenId: verifiedToken.jti,
                    }),
                )  
            ){
                return unAuthorizedException('you need to login again');
            };
        
            const user = await DBRepo.findById({
                model : UserModel, 
                id : verifiedToken.sub,
            });
        
            if(!user){
                return unAuthorizedException('Account not found , signup again');
            };


            if(verifiedToken.iat * 1000 < user.changeCreditTime){
                return unAuthorizedException('You need to login again');
            }

//bt add fel req 2 keys user shaiel el data bta3t el user wel tany shaiel el data bta3et el token 
            req.user = user;
            req.tokenPayload = verifiedToken;
            next();
    }
}