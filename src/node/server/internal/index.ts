import {Router} from 'express';
import {chats} from './chats.js';

const internalApi: Router = Router();

internalApi.use('/chats', chats);

export {internalApi};
