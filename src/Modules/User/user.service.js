// import { TOKEN_SIGNATURE_USER , TOKEN_SIGNATURE_ADMIN } from '../../../config/config.service.js';
import * as DBRepo from '../../DB/db.repository.js';
import UserModel from '../../DB/Models/User.Model.js';
import { RoleEnum  } from '../../Common/Enums/user.enum.js';
import jwt from 'jsonwebtoken';
import { decodeToken, generateToken, getSignature, verifyToken } from '../../Common/Security/token.js';
import { TokenType } from '../../Common/Enums/token.enum.js';
import { badRequestException, unAuthorizedException } from '../../Common/Response/response.js';
import { TOKEN_SIGNATURE_ADMIN_ACCESS , TOKEN_SIGNATURE_ADMIN_REFRESH , TOKEN_SIGNATURE_USER_ACCESS , TOKEN_SIGNATURE_USER_REFRESH } from "../../../config/config.service.js";





export async function renewToken(userData) {

    const {accessSignature } = getSignature(userData.role);

    const newAccessToken = generateToken({
        signature : accessSignature , 
        options: {
            audience : [userData.role , TokenType.access] , 
            expiresIn : 60 * 15 , 
            subject : userData._id.toString(),
        },
    })
    return newAccessToken ;
};