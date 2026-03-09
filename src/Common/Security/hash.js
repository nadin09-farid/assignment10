import {compare , hash} from 'bcrypt';
import { SALT_ROUND } from '../../../config/config.service.js';

////////////////////////// this syntax --> object destructing 
export async function hashOperation({plainText , rounds = SALT_ROUND}) {
    return await hash(plainText , rounds);
};

export async function compareOperation({plainValue , hashedValue}) {
    return await compare(plainValue , hashedValue);
};