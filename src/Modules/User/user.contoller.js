import express from 'express';
import { successResponse } from "../../Common/Response/response.js";
import * as userService from './user.service.js';
import { authentication } from '../../Middleware/authentication.middleware.js';
import { TokenType } from '../../Common/Enums/token.enum.js';
import { allowedFileFormats, localUpload } from '../../Common/Multer/multer.config.js';
import { validation } from '../../Middleware/validation.middleware.js';
import { coverPicSchema } from './user.validation.js';
import { isAdmin } from '../../Middleware/isAdmin.middleware.js';
import { updatePasswordSchema } from './user.validation.js';
const userRouter = express.Router();

userRouter.get('/getUserProfile', authentication(), async (req, res) => {
    return successResponse({ res, statusCode: 201, data: req.user });
});

userRouter.get('/renew-token',
    authentication(TokenType.refresh),
    async (req, res) => {
        const result = await userService.renewToken(req.user);
        return successResponse({ res, statusCode: 201, data: result });
    });

userRouter.post('/upload-mainPic', authentication(),
    localUpload({
        folderName: 'User',
        allowedFileFormat: allowedFileFormats.img,
    }).single('profilePic')

    , async (req, res) => {
        const result = await userService.updateProfilePic(req.user._id, req.file);
        return successResponse({ res, statusCode: 201, data: result });
    });

userRouter.post('/upload-coverPics', authentication(),
    localUpload({
        folderName: 'User',
        allowedFileFormat: allowedFileFormats.img,
    }).array('coverPics', 2),
    validation(coverPicSchema)
    , async (req, res) => {
        console.log('FILES UPLOADED:', req.files);

        const result = await userService.coverProfilePic(req.user._id, req.files);
        return successResponse({ res, statusCode: 201, data: result });
    });

userRouter.get('/profile/:userId', async (req, res) => {
    const result = await userService.visitProfile(req.params.userId);
    return res.status(200).json({
        message: 'Profile visited',
        
    });
});

userRouter.get(
    '/profile/:userId/visits',
    authentication(),
    isAdmin(),
    async (req, res, next) => {
        const count = await userService.getVisitCount(req.params.userId);
        res.json({ visitCount: count });
    
}
);
// delete pic
userRouter.delete('/profile/image', authentication(), async (req, res) => {
    const result = await userService.removeProfileImage(req.user._id);
    return successResponse({ res, statusCode: 200, data: result });
});

userRouter.patch('/update-password', authentication(),
    validation(updatePasswordSchema)
    , async (req, res) => {
        await userService.updatePassword(req.body, req.user);
        return successResponse({ res,  data: 'Done' });
    });


userRouter.post('/logout', authentication(), async (req, res) => {
    const result = await userService.logout(req.user._id, req.tokenPayload);
    return successResponse({ res, data: result });

})

export default userRouter;


