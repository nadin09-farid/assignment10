
// dotenv -> loads enviroment vars from .env to the process.env
//y3ni port = 3000 hatkoon accessable as process.env.PORT
import dotenv from 'dotenv';
import path from 'path';

// decides anhi config file han use dev wala prod
export const NODE_ENV = process.env.NODE_ENV; 

//resolve -> bn convert mn relative paths le absolute paths 
const envPath = {
    dev : path.resolve('./config/.env.dev'),
    prod : path.resolve('./config/.env.prod'),
};

//bn use dotenv 34an n read el data eli mawgooda fel env w bn3ml kda 
// bel method config bta5ood el path bta3 el file elli 3ayza akra2o 


//envPath[NODE_ENV] --> use the NODE_ENV as eno el key eli ha7ded 
// beeh y3ni e7na fel object (envPath) 3ndna 2 keys 
// fa 34an nshoof ha5adoon anhi path el dev wala prod 
// han determain mn el NODE_ENV 
dotenv.config({path : envPath[NODE_ENV || 'dev'] });



// HNA baa hn3ml export lel vars dol 34an ykoon ashabl bdl ma fe kol
// file n23ood n3ml process.env. fa n3mlha mara wahda wn import e 5las
export const SERVER_PORT = process.env.PORT || 3000;
export const DB_URL_LOCAL = process.env.DB_URL_LOCAL || "";
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const SALT_ROUND = Number(process.env.SALT_ROUND) || 10;

export const REDIS_URL = process.env.REDIS_URL || "";




export const TOKEN_SIGNATURE_USER_ACCESS = process.env.TOKEN_SIGNATURE_USER_ACCESS;
export const TOKEN_SIGNATURE_USER_REFRESH = process.env.TOKEN_SIGNATURE_USER_REFRESH;
export const TOKEN_SIGNATURE_ADMIN_ACCESS = process.env.TOKEN_SIGNATURE_ADMIN_ACCESS;
export const TOKEN_SIGNATURE_ADMIN_REFRESH = process.env.TOKEN_SIGNATURE_ADMIN_REFRESH;

export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;

