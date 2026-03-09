import express from 'express';
import { successResponse } from "../../Common/Response/response.js";
import * as userService from './user.service.js';
import { authentication } from '../../Middleware/authentication.middleware.js';
import { TokenType } from '../../Common/Enums/token.enum.js';
import { upload } from '../../Common/Multer/multer.js';

const userRouter = express.Router();

userRouter.get('/getUserProfile',authentication() , async(req , res) => {
    return successResponse({res , statusCode: 201 , data: req.user});
});

userRouter.get('/renew-token' ,
    authentication(TokenType.refresh),
    async(req , res) => {
        const result = await userService.renewToken(req.user);
        return successResponse({res , statusCode: 201 , data: result});
});


userRouter.post("/upload-profile", upload.single("image"), (req, res) => {
        res.json({ message: "Image uploaded successfully", file: req.file});
    }
);

export default userRouter;