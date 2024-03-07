import {Response, Router} from 'express';

import {RequestWithBody} from '../shared/types.js';
import {ChatTransaction} from '../../node.js';

const chats: Router = Router();

chats.post(
  '/process',
  (req: RequestWithBody<{transaction: ChatTransaction}>, res: Response) => {
    const {node, body} = req;

    const transaction = node.processChatTransaction(body.transaction);

    res.json({transaction});
  }
);

export {chats};
