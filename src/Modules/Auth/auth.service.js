import jwt from "jsonwebtoken";
import { ENCRYPTION_KEY, TOKEN_SIGNATURE_ADMIN_ACCESS, TOKEN_SIGNATURE_ADMIN_REFRESH, TOKEN_SIGNATURE_USER_ACCESS, TOKEN_SIGNATURE_USER_REFRESH } from "../../../config/config.service.js";
import { badRequestException, conflictException, notFoundException } from "../../Common/Response/response.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import UserModel from "../../DB/Models/User.Model.js";
import * as DBRepo from '../../DB/db.repository.js';
import CryptoJS from "crypto-js";
import { Provider, RoleEnum } from "../../Common/Enums/user.enum.js";
import { generateToken, getSignature } from "../../Common/Security/token.js";
import { TokenType } from "../../Common/Enums/token.enum.js";
import { OAuth2Client } from 'google-auth-library';
import { generateOTP } from "../../Common/Security/otp.js";
import { sendEmail } from "../../Common/Security/sendEmail.js";



export async function signup(bodyData) {
    const { email } = bodyData;

    const isEmail = await DBRepo.findOne({
        model: UserModel,
        filters: { email },
    });

    if (isEmail) {
        return conflictException("Email already exists");
    }

    bodyData.password = await hashOperation({ plainText: bodyData.password });

    const phoneEncrypted = CryptoJS.AES.encrypt(
        bodyData.phone,
        ENCRYPTION_KEY,
    );

    bodyData.phone = phoneEncrypted;

    const result = await DBRepo.create({
        model: UserModel,
        insertedData: bodyData,
    });
    return result;

};

export async function login(bodyData, url) {

    const { email, password } = bodyData;

    const user = await DBRepo.findOne({ model: UserModel, filters: { email } });

    if (!user) {
        return notFoundException("Invalid INFO");
    }

    const isPasswordValid = await compareOperation({
        plainValue: password,
        hashedValue: user.password,
    });

    if (!isPasswordValid) {
        return notFoundException("Invalid INFO");
    }


    const { accessSignature, refreshSignature } = getSignature(user.role);

    const access_token = generateToken({
        signature: accessSignature,
        options: {
            audience: [user.role, TokenType.access],
            expiresIn: 60 * 15,
            subject: user._id.toString(),
        },
    });

    const refresh_token = generateToken({
        signature: refreshSignature,
        options: {
            audience: [user.role, TokenType.refresh],
            expiresIn: "1y",
            subject: user._id.toString(),
        },
    });
    //    , {
    //     noTimestamp : true,
    //     subject: user._id.toString() ,
    //     expiresIn : 30,
    //     notBefore : 30,
    //     issuer : url , 
    //     audience: ['order_server' , 'email_server'],    
    // }



    return { access_token, refresh_token };

};

async function verifyGoogleToken(idToken) {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
        idToken,
        audience: '377351786664-5lf8ed32878t798e15rmjcq6h4u5l20d.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    return payload;
};


export async function loginWithGmail(idToken) {
    const payloadGoogleToken = await verifyGoogleToken(idToken);

    if(!payloadGoogleToken.email_verified){
        return badRequestException("Email must be verified");
    };

    const user = await DBRepo.findOne({
        model: UserModel, 
        filters : { email : payloadGoogleToken.email , provider : Provider.Google},
    });

    const { accessSignature, refreshSignature } = getSignature(user.role);

    const access_token = generateToken({
        signature: accessSignature,
        options: {
            audience: [user.role, TokenType.access],
            expiresIn: 60 * 15,
            subject: user._id.toString(),
        },
    });

    const refresh_token = generateToken({
        signature: refreshSignature,
        options: {
            audience: [user.role, TokenType.refresh],
            expiresIn: "1y",
            subject: user._id.toString(),
        },
    });
    return { access_token, refresh_token };

};


export async function signupWithGmail(idToken) {
    const payloadGoogleToken = await verifyGoogleToken(idToken);

// lazem el email ykoon verified eno tmam
    if(!payloadGoogleToken.email_verified){
        return badRequestException("Email must be verified");
    };

// check if email exists or not + provider is google wla system
//lw el provider => system handeh error w han2olo y login bel password eli 3malo
// lw el provider => google --> hanroo7 baa 3la el login function //
// han5aleeh y3ml login up 34an hwa already 3amel signup bel email da marra hya msh sho8lana
    const user = await DBRepo.findOne({
        model: UserModel, 
        filters : { email : payloadGoogleToken.email},
    });

// Email Exists + Provider is System  -->> han2oolo y login b his acc wel pass
    if(user){
        if(user.provider == Provider.System){
            return badRequestException("Account Already exists , Login with password");
        }
        return {status : 200 , result: await loginWithGmail(idToken)}; 
    };

// el email msh bi exists baa fa han store el data fel database 3ade

    const newUser = await DBRepo.create({
        model : UserModel , 
        insertedData : {
            email : payloadGoogleToken.email ,
            userName : payloadGoogleToken.name,
            provider : Provider.Google,
// mada 3adda aslun mn el check elli foo2 da yb2a true 
            confirmEmail  : true,
        },
    });
    const { accessSignature, refreshSignature } = getSignature(user.role);

    const access_token = generateToken({
        signature: accessSignature,
        options: {
            audience: [user.role, TokenType.access],
            expiresIn: 60 * 15,
            subject: user._id.toString(),
        },
    });

    const refresh_token = generateToken({
        signature: refreshSignature,
        options: {
            audience: [user.role, TokenType.refresh],
            expiresIn: "1y",
            subject: user._id.toString(),
        },
    });
    return {status : 201 , result:  { access_token, refresh_token }}; 
}; 

// registeration with otp

export async function Registeration (bodyData) {

    const {userName,email,password} = bodyData;

    const otp = generateOTP();

    const user = await UserModel.create({

        userName,
        email,
        password,
        otp,
        otpExpires: Date.now() + 5 * 60 * 1000

    });

    await sendEmail({
        to: email,
        subject:"Verify your account",
        text:`Your OTP is ${otp} and it expires in 5 minutes`
    });

    return {message:"User created, OTP sent to email" , user};     
};

export async function verifyOTP  (req,res) {

    const {email,otp} = req.body;

    const user = await UserModel.findOne({email});

    if(!user){
        return res.json({message:"User not found"});
    }

    if(user.otp !== otp){
        return res.json({message:"Invalid OTP"});
    }

    if(Date.now() > user.otpExpires){
        return res.json({message:"OTP expired"});
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return res.json({
        message:"Account verified successfully"
    });

};