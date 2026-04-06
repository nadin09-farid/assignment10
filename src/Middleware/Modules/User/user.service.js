// import { TOKEN_SIGNATURE_USER , TOKEN_SIGNATURE_ADMIN } from '../../../config/config.service.js';
import * as DBRepo from '../../DB/db.repository.js';
import UserModel from '../../DB/Models/User.Model.js';
import { RoleEnum } from '../../Common/Enums/user.enum.js';
import jwt from 'jsonwebtoken';
import { decodeToken, generateToken, getSignature, verifyToken } from '../../Common/Security/token.js';
import { TokenType } from '../../Common/Enums/token.enum.js';
import { badRequestException, unAuthorizedException } from '../../Common/Response/response.js';
import { TOKEN_SIGNATURE_ADMIN_ACCESS, TOKEN_SIGNATURE_ADMIN_REFRESH, TOKEN_SIGNATURE_USER_ACCESS, TOKEN_SIGNATURE_USER_REFRESH } from "../../../../config/config.service.js";
import fs from 'node:fs';
import path from 'node:path';
import * as redisMethods from '../../DB/redis.service.js';



export async function renewToken(userData) {

    const { accessSignature } = getSignature(userData.role);

    const newAccessToken = generateToken({
        signature: accessSignature,
        options: {
            audience: [userData.role, TokenType.access],
            expiresIn: 60 * 15,
            subject: userData._id.toString(),
        },
    })
    return newAccessToken;
};

export async function updateProfilePic(userId, file) {
    await DBRepo.updateOne({
        model: UserModel,
        filter: { _id: userId },
        data: { profile_pic: file.finalPath },
    });
};

export async function coverProfilePic(userId, files) {
    const profilePicsPath = files.map((file) => {
        return file.finalPath;
    });
    await DBRepo.updateOne({
        model: UserModel,
        filter: { _id: userId },
        data: { cover_pics: profilePicsPath },
    });
};

export async function removeProfileImage(userId) {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.profile_pic) {
        throw new Error('No profile image found');
    }

    const fullPath = path.resolve(user.profile_pic);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }

    user.profile_pic = null;
    await user.save();

    return { message: 'Profile image deleted successfully' };
};

export async function visitProfile(userId) {
    const user = await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { visitCount: 1 } },
        { new: true }
    );

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

export async  function getVisitCount (userId) {
    const user = await UserModel.findById(userId).select('visitCount');

    if (!user) {
        throw new Error('User not found');
    }

    return user.visitCount;
};

export async function logout(userId, tokenData, logoutOptions) {


    if (logoutOptions == 'all') {
        await DBRepo.updateOne({
            model: UserModel,
            filter: { _id: userId },
            insertedData: { changeCreditTime: new Date() },
        });
    }
    else {
        await redisMethods.set({
            key: redisMethods.blackListTokenKey({
                userId: userId,
                tokenId: tokenData.jti,
            }),
            value: tokenData.jti,
            exValue: 60 * 60 * 24 * 365 - (Date.now() / 1000 - tokenData.iat),
        })
    }
};