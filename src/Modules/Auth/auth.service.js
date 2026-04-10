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
import { generateOTP } from "../../Common/OTP/otp.service.js";
import { sendEmail } from "../../Common/Email/email.config.js";
import { EmailEnum } from "../../Common/Enums/email.enum.js";
import * as RedisMethods from '../../DB/redis.service.js'


async function sendEmailOTP({email , emailType , subject}) {

    //1- awl haga hnshof el otp bta3 el email da lsa valid wel ttl bta3o lsa > 0 wala baa b - yaani khlas mab2alsh fe otp fel cache lel email da

    const prevOtpTTL = await RedisMethods.ttl(
        RedisMethods.getOTPKey({email , emailType}),
    );

    if(prevOtpTTL > 0 ){
        return badRequestException(
            `There is already a valid OTP for ${prevOtpTTL} seconds`,
        );
    };
//2- check if it is blocked
    const isBlocked = await RedisMethods.exists(
        RedisMethods.getOTPBlockedKey({email , emailType}),
    );

    if (isBlocked){
        return badRequestException("Try Again Later")
    };
//3- check num of attempts bta3t el user eno aayez otp 
    const reqNo = await RedisMethods.get(
        RedisMethods.getOTPReqNoKey({email , emailType}),
    );

// lw = 5 ha7ot el user da fel redis as eno blocked by that key eli bi refer eno blocked yaani
    if(reqNo == 5) {
        await RedisMethods.set({
        key : RedisMethods.getOTPReqNoKey({email , emailType}),
        value : 1,
        exValue : 10 * 60,
        });

        return badRequestException('You Cannot Request More Than 5 Emails in 20 mins .')
    };
// lw 3adda mn kol da khlas han3mlo otp aade 

    const otp = generateOTP();

    await sendEmail ({
        to : email , 
        subject : subject,
        html: `<h1>Your OTP : ${otp} </h1>`,
    });

    await RedisMethods.set({
        key : RedisMethods.getOTPKey({email , emailType}),
        value : await hashOperation({plainText : otp}),
        exValue : 120,
    });

    // b3d ma b3atna email han increment el number of attempts b 1

    await RedisMethods.incr(RedisMethods.getOTPReqNoKey({email , emailType}));

}


export async function signup(bodyData) {

// first we destruct the email to check hwa kan aandi aslun fel db wala laa
    const { email } = bodyData;

    const isEmail = await DBRepo.findOne({
        model: UserModel,
        filters: { email },
    });

// lw aandi ndelo error
    if (isEmail) {
        return conflictException("Email already exists");
    }
// lw laa khlas baa hnzabt el donya hn3ml hash lel pass w encrypt lel phone num

    bodyData.password = await hashOperation({ plainText: bodyData.password });

    const phoneEncrypted = CryptoJS.AES.encrypt(
        bodyData.phone,
        ENCRYPTION_KEY,
    );

    bodyData.phone = phoneEncrypted;

// w fel a5er khales han add el user aandi fel db
    const result = await DBRepo.create({
        model: UserModel,
        insertedData: bodyData,
    });


    await sendEmailOTP({email , emailType: EmailEnum.confirmEmail,
    subject: "Confirm Your Email"});
    return result;

};

export async function confirmEmail(bodyData) {

// bna5od mn el user el email bta3o wel otp elli user da5alo
    const{email , otp} = bodyData;

// check el email da aandi wla laa +++++++ el email mat3mloosh confirm 
    const user = await DBRepo.findOne({
        model : UserModel , 
        filters : {email , confirmEmail : false},
    });

    if (!user){
        return badRequestException('Invalid EmaiL OR Email already Confirmed')
    };
// kda khalasna el email check , door el otp baa , hngeeb el hashed otp mn el cache
    const storedOtp = await RedisMethods.get(
        RedisMethods.getOTPKey({email , emailType: EmailEnum.confirmEmail}),
    );

    if (!storedOtp){
        return badRequestException('OTP Expired');
    };
// wn compare baa eli el user d5alo m3 el original elli 3amlnalo store w hashing
    const isOtpValid = await compareOperation({
        plainValue : otp,
        hashedValue : storedOtp,
    });

    if (!isOtpValid){
        return badRequestException('OTP Not Valid');
    };


// lw el confirmation sa7 khalas hn khaly el confirmEmail bta3et el user da b true 
    user.confirmEmail = true;
    await user.save();
    
};

export async function resendConfirmEmailOTP(email){
await sendEmailOTP({email , emailType : EmailEnum.confirmEmail , subject: "Another OTP TO Confirm Your Email"});
};

export async function resendForgetPasswordOTP(email){
await sendEmailOTP({email , emailType : EmailEnum.forgetPassword , subject: "Another OTP TO Reset Your Password"});
};


export async function sendOTPForgetPassword(email){
    const user = await DBRepo.findOne({
        model : UserModel , 
        filters: {email}
    });

    if(!user){
        return;
    };

    if(!user.confirmEmail){
        return badRequestException('Confirm Your Email First ..')
        
    }
    await sendEmailOTP({
        email ,
        emailType : EmailEnum.forgetPassword ,
        subject: "Rest Your Password"
    });
};

export async function verifyOTPForgetPassword(bodyData) {
    const {email , otp} = bodyData;
    
    const emailOTP = await RedisMethods.get(
        RedisMethods.getOTPKey({email , emailType : EmailEnum.forgetPassword}),
    );

    if(!emailOTP){
        return badRequestException('OTP Expired');
    };

    const isOtpValid = await compareOperation({
        plainValue : otp , 
        hashedValue : emailOTP,
    });

    if(!isOtpValid){
        return badRequestException('OTP Not Valid')
    };
    
};

// export async function resetPassword(bodyData) {
//     const {email ,password , otp} = bodyData;

//     await verifyOTPForgetPassword({email , otp});

//     await DBRepo.updateOne({
//         model: UserModel , 
//         filters : {email},
//         insertedData : {password : await hashOperation({plainText : password})},
//     });
//     return ;
// };

export async function resetPassword(bodyData) {

    const {email ,password , otp} = bodyData;

    // 1️⃣ verify OTP
    const storedOtp = await RedisMethods.get(
        RedisMethods.getOTPKey({ email, emailType: EmailEnum.forgetPassword })
    );

    if (!storedOtp) {
        return badRequestException("OTP Expired");
    }

    const isValid = await compareOperation({
        plainValue: otp,
        hashedValue: storedOtp,
    });

    if (!isValid) {
        return badRequestException("Invalid OTP");
    }

    // 2️⃣ hash new password
    const hashedPassword = await hashOperation({
        plainText: password,
    });

    // 3️⃣ update password
    await DBRepo.updateOne({
        model: UserModel,
        filters: { email },
        data: { password: hashedPassword },
    });

    // 4️⃣ delete OTP (VERY IMPORTANT 🔥)
    await RedisMethods.del(
        RedisMethods.getOTPKey({ email, emailType: EmailEnum.forgetPassword })
    );

    return { message: "Password reset successfully" };
}

export async function login(bodyData, url) {

    const { email, password } = bodyData;

    const user = await DBRepo.findOne({ model: UserModel, filters: { email } });

    if (!user) {
        return notFoundException("Invalid INFO");
    };


    if (!user.confirmEmail) {
        return badRequestException("You Need To Confirm Your Email First ..");
    }

    const isPasswordValid = await compareOperation({
        plainValue: password,
        hashedValue: user.password,
    });

    if (!isPasswordValid) {
        return notFoundException("Invalid INFO");
    }


    const { access_token, refresh_token } = generateToken(user);

    return { access_token, refresh_token };

};


// assignment 12 login function :
export async function login_2(bodyData) {
    const { email, password } = bodyData;

    const attemptsKey = `login:attempts:${email}`;
    const blockKey = `login:block:${email}`;

    // 1️⃣ Check if user is blocked
    const isBlocked = await RedisMethods.exists(blockKey);
    if (isBlocked) {
        return badRequestException("Account temporarily locked. Try again after 5 minutes.");
    }

    // 2️⃣ Check if user exists
    const user = await DBRepo.findOne({
        model: UserModel,
        filters: { email },
    });

    if (!user) {
        return notFoundException("Invalid email or password");
    }

    // 3️⃣ Check email confirmation
    if (!user.confirmEmail) {
        return badRequestException("Please confirm your email first");
    }

    // 4️⃣ Validate password
    const isPasswordValid = await compareOperation({
        plainValue: password,
        hashedValue: user.password,
    });

    if (!isPasswordValid) {
        // increment attempts
        const attempts = await RedisMethods.incr(attemptsKey);

        // block after 5 attempts
        if (attempts >= 5) {
            await RedisMethods.set({
                key: blockKey,
                value: true,
                exValue: 5 * 60, // 5 minutes
            });

            await RedisMethods.del(attemptsKey);

            return badRequestException("Account locked for 5 minutes due to multiple failed attempts");
        }

        return badRequestException(`Invalid password (${attempts}/5)`);
    }

    // 5️⃣ Reset attempts on successful login
    await RedisMethods.del(attemptsKey);

    // 6️⃣ Check if 2FA enabled
    if (user.twoStepEnabled) {
        await sendEmailOTP({
            email: user.email,
            emailType: EmailEnum.login2FA,
            subject: "Your Login OTP",
        });

        return {
            message: "OTP sent to your email. Please verify to complete login.",
        };
    }

    // 7️⃣ Generate tokens (normal login)
    const { access_token, refresh_token } = generateToken(user);

    return {
        access_token,
        refresh_token,
    };
};

export async function enable2FA(user) {
    await sendEmailOTP({
        email: user.email,
        emailType: EmailEnum.enable2FA,
        subject: "Enable 2FA OTP"
    })
};

export async function confirm2FA(bodyData) {

    const { email, otp } = bodyData;
    const storedOtp = await RedisMethods.get(
        RedisMethods.getOTPKey({ email, emailType: EmailEnum.enable2FA })
    );

    if (!storedOtp) return badRequestException("OTP Expired");

    const isValid = await compareOperation({
        plainValue: otp,
        hashedValue: storedOtp
    });

    if (!isValid) return badRequestException("Invalid OTP");

    await DBRepo.updateOne({
        model: UserModel,
        filters: { email },
        data: { twoStepEnabled: true }
    });

    await RedisMethods.del(
        RedisMethods.getOTPKey({ email, emailType: EmailEnum.enable2FA })
    );

    return { message: "2FA Enabled" };
};

export async function confirmLogin2FA(bodyData) {

    const { email, otp } = bodyData;
    const storedOtp = await RedisMethods.get(
        RedisMethods.getOTPKey({ email, emailType: EmailEnum.login2FA })
    );

    if (!storedOtp) return badRequestException("OTP Expired");

    const isValid = await compareOperation({
        plainValue: otp,
        hashedValue: storedOtp
    });

    if (!isValid) return badRequestException("Invalid OTP");

    const user = await DBRepo.findOne({ model: UserModel, filters: { email } });

    const tokens = generateToken(user);

    await RedisMethods.del(
        RedisMethods.getOTPKey({ email, emailType: EmailEnum.login2FA })
    );

    return tokens;
};


export async function updatePasswordAuthenticated(user, { oldPassword, newPassword }) {

    const isValid = await compareOperation({
        plainValue: oldPassword,
        hashedValue: user.password,
    });

    if (!isValid) {
        return badRequestException("Wrong old password");
    }

    await DBRepo.updateOne({
        model: UserModel,
        filters: { _id: user._id },
        data: {
            password: await hashOperation({ plainText: newPassword })
        }
    });

    return { message: "Password updated successfully" };
}


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
    const { accessSignature, refreshSignature } = getSignature(newUser.role);

    const access_token = generateToken({
        signature: accessSignature,
        options: {
            audience: [newUser.role, TokenType.access],
            expiresIn: 60 * 15,
            subject: newUser._id.toString(),
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

// export async function Registeration (bodyData) {

//     const {userName,email,password} = bodyData;

//     const otp = generateOTP();

//     const user = await UserModel.create({

//         userName,
//         email,
//         password,
//         otp,
//         otpExpires: Date.now() + 5 * 60 * 1000

//     });

//     await sendEmail({
//         to: email,
//         subject:"Verify your account",
//         text:`Your OTP is ${otp} and it expires in 5 minutes`
//     });

//     return {message:"User created, OTP sent to email" , user};     
// };

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