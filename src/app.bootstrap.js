import express from 'express';
import { SERVER_PORT , NODE_ENV } from '../config/config.service.js';
import testDBConnection from './DB/connection.js';
import authRouter from './Modules/Auth/auth.controller.js';
import { globalErrHandling } from './Common/Response/response.js';
import userRouter from './Modules/User/user.contoller.js';
import cors from 'cors';
import path from 'node:path';
import { testRedisConnection } from './DB/redis.connection.js';

async function bootstrap(){
    const app = express();    
    const port = SERVER_PORT;
    await testDBConnection();
    await testRedisConnection();

    
    app.use(express.json() , cors());

// rednering a pic on the browser ------>  express.static
    app.use('/uploads' , express.static(path.resolve("./uploads")));

    app.use('/auth' , authRouter);
    app.use('/user' , userRouter);

    app.use(globalErrHandling);

    app.listen(port , () => {
        console.log(`Server is running on port ${port}`);
    })
}

export default bootstrap;