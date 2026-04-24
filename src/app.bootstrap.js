import express from 'express';
import { SERVER_PORT , NODE_ENV } from '../config/config.service.js';
import testDBConnection from './DB/connection.js';
import authRouter from './Modules/Auth/auth.controller.js';
import { globalErrHandling } from './Common/Response/response.js';
import userRouter from './Modules/User/user.contoller.js';
import cors from 'cors';
import path from 'node:path';
import { testRedisConnection } from './DB/redis.connection.js';
import messageRouter from './Modules/Message/message.controller.js';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import geoip from "geoip-lite";
import * as redisMethods from '../src/DB/redis.service.js'

async function bootstrap(){
    const app = express();    
    const port = SERVER_PORT;
    await testDBConnection();
    await testRedisConnection();

    // app.set('trust proxy' , true);
    
    app.use(express.json() , 
    cors({origin : "*"}) ,
    // helmet(),
    // rateLimit({
    //     windowMs: 5 * 60 * 1000,
    //     limit : (req , res) =>{
    //         const geoInfo = geoip.lookup(req.ip);
    //         return geoInfo.country == 'EG' ? 3 : 1;
    //     },
    //     legacyHeaders: false ,
    //     handler : (req , res) => {
    //         return res.status(401).json({msg : 'Too Many Requests'});
    //     },
    //     requestPropertyName : 'RateLimit',
    //     keyGenerator: (req)=> {
    //         const ip = ipKeyGenerator(req.ip);
    //         return `${ip}-${req.path}`;
    //     },

    //     store : {
    //         async incr(key , cb) {
    //             const hits = await redisMethods.incr(key);
    //             if (hits == 1) {
    //                 await redisMethods.setExpire(key , 60);
    //             }
    //             cb(null , hits);
    //         },

    //         async decrement(key) {
    //             const isKeyExists = await redisMethods.exists(key);
    //             if (isKeyExists) {
    //                 await redisMethods.decr(key);
    //             }
    //         },
    //     },
    // }),
);

// app.use((req , res , next) => {
//     console.log(req.headers['x-forwarded-for']);
//     console.log(req.ip);
//     console.log({'req.rateLimit' : req.rateLimit});
//     next();
// })

// rednering a pic on the browser ------>  express.static
    app.use('/uploads' , express.static(path.resolve("./uploads")));

    app.use('/auth' , authRouter);
    app.use('/user' , userRouter);
    app.use('/message' , messageRouter);

    app.use(globalErrHandling);

    app.listen(port , () => {
        console.log(`Server is running on port ${port}`);
    })
}

export default bootstrap;