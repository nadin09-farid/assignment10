// import { TOKEN_SIGNATURE_ADMIN_ACCESS, TOKEN_SIGNATURE_ADMIN_REFRESH, TOKEN_SIGNATURE_USER_ACCESS, TOKEN_SIGNATURE_USER_REFRESH } from "../../../config/config.service.js";
import { RoleEnum } from "../Enums/user.enum.js";
import jwt from "jsonwebtoken";

import {
    TOKEN_SIGNATURE_USER_ACCESS,
    TOKEN_SIGNATURE_USER_REFRESH,
    TOKEN_SIGNATURE_ADMIN_ACCESS,
    TOKEN_SIGNATURE_ADMIN_REFRESH
} from '../../../config/config.service.js';

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


export function generateToken({ payload = {}, signature, options = {} }) {
    return jwt.sign(payload, signature, options);
};

export function verifyToken({ token, signature }) {
    return jwt.verify(token, signature);
};

export function decodeToken(token) {
    return jwt.decode(token);
};



