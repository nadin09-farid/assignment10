import { 
    TOKEN_SIGNATURE_ADMIN_ACCESS,
    TOKEN_SIGNATURE_ADMIN_REFRESH, 
    TOKEN_SIGNATURE_USER_ACCESS, 
    TOKEN_SIGNATURE_USER_REFRESH 
} from "../../../config/config.service.js";
import { TokenType } from "../Enums/token.enum.js";
import { RoleEnum } from "../Enums/user.enum.js";
import jwt from "jsonwebtoken";
import {randomUUID} from 'crypto';


export function getSignature(role = RoleEnum.User) {

    let accessSignature = "";
    let refreshSignature = "";
    switch (role) {
        case RoleEnum.User:
            accessSignature = TOKEN_SIGNATURE_USER_ACCESS;
            refreshSignature = TOKEN_SIGNATURE_USER_REFRESH;
            break;

        case RoleEnum.Admin:
            accessSignature = TOKEN_SIGNATURE_ADMIN_ACCESS;
            refreshSignature = TOKEN_SIGNATURE_ADMIN_REFRESH;
            break;

    }
    return { accessSignature, refreshSignature };
};

export function signToken({ payload = {}, signature, options = {} }) {
    return jwt.sign(payload, signature, options);
};

export function verifyToken({ token, signature }) {
    return jwt.verify(token, signature);
};

export function decodeToken(token) {
    return jwt.decode(token);
};


export function generateToken(user) {
    const {accessSignature , refreshSignature} = getSignature(user.role);
    

    const tokenId = randomUUID();

    const access_token = signToken({
        signature : accessSignature , 
        options : {
            subject : user._id.toString(),
            audience : [user.role , TokenType.access],
            expiresIn : 60 * 15,
            jwtid : tokenId,
        },
    });

    const refresh_token = signToken({
        signature : refreshSignature , 
        options : {
            subject : user._id.toString(),
            audience : [user.role , TokenType.refresh],
            expiresIn : '1y',
            jwtid : tokenId,
        },
    });

    return {access_token , refresh_token};
};




