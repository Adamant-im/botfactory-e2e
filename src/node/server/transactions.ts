import {Response, Router} from 'express';

import {RequestWithBody, RequestWithQuery} from './shared/types.js';
import {ChatTransaction} from '../node.js';

const transactions: Router = Router();

transactions.post(
  '/process',
  (req: RequestWithBody<{transaction: ChatTransaction}>, res: Response) => {
    const {node, body} = req;

    const transaction = node.processChatTransaction(body.transaction);

    res.json({transaction});
  }
);

export {transactions};
