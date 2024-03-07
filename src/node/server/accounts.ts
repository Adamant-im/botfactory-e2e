import {Response, Router} from 'express';

import {RequestWithQuery} from './shared/types.js';
import {requireProperties} from './shared/utils.js';

const accounts: Router = Router();

accounts.get(
  '/getPublicKey',
  requireProperties(['address']),
  (req: RequestWithQuery<{address: string}>, res: Response) => {
    const {node, query} = req;

    const account = node.getAccount(query.address);

    const {timestamp: nodeTimestamp} = node;

    if (!account) {
      return res.json({
        success: false,
        nodeTimestamp,
        error: 'Account not found',
      });
    }

    res.json({
      publicKey: account.publicKey,
      success: true,
      nodeTimestamp,
    });
  }
);

accounts.get(
  '/getBalance',
  requireProperties(['address']),
  (req: RequestWithQuery<{address: string}>, res: Response) => {
    const {node, query} = req;

    const account = node.getAccount(query.address);

    const {timestamp: nodeTimestamp} = node;

    // nodes return 0 balance when account is not found
    const balance = account?.balance || {
      balance: '0',
      unconfirmedBalance: '0',
    };

    res.json({
      ...balance,
      success: true,
      nodeTimestamp,
    });
  }
);

export {accounts};
