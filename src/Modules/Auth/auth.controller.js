import express, { json } from 'express';
import * as authService from './auth.service.js';
import { successResponse } from '../../Common/Response/response.js';
import { validation } from '../../Middleware/validation.middleware.js';
import { loginSchema, signupSchema } from './auth.validation.js';
import { allowedFileFormats, localUpload } from '../../Common/Multer/multer.config.js';

const authRouter = express.Router();


authRouter.get('/', (req, res) => {
    return res.json({ msg: "User Page" });
});

authRouter.post('/signup', validation(signupSchema), async (req, res) => {

    const result = await authService.signup(req.vbody);
    return successResponse({ res, statusCode: 201, data: result });
});

authRouter.post('/signup/gmail', async (req, res) => {
    const { status, result } = await authService.signupWithGmail(req.body.idToken);
    return successResponse({ res, statusCode: status, data: result });
});


authRouter.post('/login', validation(loginSchema), async (req, res) => {
    const result = await authService.login(req.body);
    return successResponse({ res, statusCode: 201, data: result });
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