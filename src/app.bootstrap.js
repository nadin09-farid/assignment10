import express from 'express';
import { SERVER_PORT , NODE_ENV } from '../config/config.service.js';
import testDBConnection from './DB/connection.js';
import authRouter from './Modules/Auth/auth.controller.js';
import { globalErrHandling } from './Common/Response/response.js';
import userRouter from './Modules/User/user.contoller.js';
import cors from 'cors';

async function bootstrap(){
    const app = express();    
    const port = SERVER_PORT;
    await testDBConnection();
    app.use(express.json() , cors());

    app.use('/auth' , authRouter);
    app.use('/user' , userRouter);

    app.use(globalErrHandling);

    app.listen(port , () => {
        console.log(`Server is running on port ${port}`);
    })
}

export default bootstrap;