import express, { json } from 'express';
import * as authService from './auth.service.js';
import { successResponse } from '../../Common/Response/response.js';
import { validation } from '../../Middleware/validation.middleware.js';
import { confirmEmailSchema,confirm2FAotpSchema, loginSchema, resendConfirmEmailSchema, resendOTPForgetPasswordSchema, resetPasswordSchema, sendOTPForgetPasswordSchema, signupSchema, verifyOTPForgetPasswordSchema } from './auth.validation.js';
import { allowedFileFormats, localUpload } from '../../Common/Multer/multer.config.js';
import {authentication} from '../../Middleware/authentication.middleware.js';
const authRouter = express.Router();


authRouter.get('/', (req, res) => {
    return res.json({ msg: "User Page" });
});

authRouter.post('/signup', validation(signupSchema), async (req, res) => {

    const result = await authService.signup(req.vbody);
    return successResponse({ res, statusCode: 201, data: result });
});

authRouter.post('/confirm-email', validation(confirmEmailSchema), async (req, res) => {

    const result = await authService.confirmEmail(req.vbody);
    return successResponse({ res, statusCode: 201, data: 'confirmed' });
});



authRouter.post('/send-email-forget-password', validation(sendOTPForgetPasswordSchema), async (req, res) => {

    const result = await authService.sendOTPForgetPassword(req.vbody.email);
    return successResponse({ res, statusCode: 201, data: 'CHeck Your Inbox' });
});

authRouter.post('/verify-forget-password', validation(verifyOTPForgetPasswordSchema), async (req, res) => {

    const result = await authService.verifyOTPForgetPassword(req.vbody);
    return successResponse({ res, statusCode: 201, data: 'verified' });
});

authRouter.post('/reset-password', validation(resetPasswordSchema), async (req, res) => {

    const result = await authService.resetPassword(req.vbody);
    return successResponse({ res, statusCode: 200, data: 'doneee' });
});


authRouter.post('/resend-otp-confirm-email', validation(resendConfirmEmailSchema), async (req, res) => {

    const result = await authService.resendConfirmEmailOTP(req.vbody.email);
    return successResponse({ res, statusCode: 201, data: 'check your inbox' });
});


authRouter.post('/resend-otp-reset-email', validation(resendOTPForgetPasswordSchema), async (req, res) => {

    const result = await authService.resendForgetPasswordOTP(req.vbody.email);
    return successResponse({ res, statusCode: 201, data: 'check your inbox' });
});


authRouter.post('/signup/gmail', async (req, res) => {
    const { status, result } = await authService.signupWithGmail(req.body.idToken);
    return successResponse({ res, statusCode: status, data: result });
});


authRouter.post('/login', validation(loginSchema), async (req, res) => {
    const result = await authService.login(req.body);
    return successResponse({ res, statusCode: 201, data: result });
});


authRouter.post('/login-2', validation(loginSchema), async (req, res) => {
    const result = await authService.login_2(req.body);
    return successResponse({ res, statusCode: 201, data: result });
});


// ================== ENABLE 2FA ==================
authRouter.post('/enable-2fa', authentication(), async (req, res) => {
    const result = await authService.enable2FA(req.user);
    return successResponse({ res, statusCode: 200, data: result });
});

// ================== CONFIRM 2FA ==================
authRouter.post('/confirm-2fa', validation(confirm2FAotpSchema), async (req, res) => {
    const result = await authService.confirm2FA(req.body);
    return successResponse({ res, statusCode: 200, data: result });
});

// ================== CONFIRM LOGIN 2FA ==================
authRouter.post('/confirm-login-2fa', validation(confirm2FAotpSchema), async (req, res) => {
    const result = await authService.confirmLogin2FA(req.body);
    return successResponse({ res, statusCode: 200, data: result });
});




authRouter.post("/signup-otp", async (req, res) => {
    const result = await authService.Registeration(req.body);
    return successResponse({ res, statusCode: 201, data: result });
});

authRouter.post(
    '/signup-upload' , 
    localUpload({folderName : 'User' , 
                allowedFileFormat : allowedFileFormats.img}).single('profilePic'),
    async(req , res) => {
        return successResponse({res , statusCode: 201 , data : 'Result'});
    });

export default authRouter;