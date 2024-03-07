import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import {config} from '../config.js';

import {internalApi} from './internal/index.js';
import {accounts} from './accounts.js';
import {transactions} from './transactions.js';

const app: Express = express();

const servers = Router();

servers.use('/accounts', accounts);
servers.use('/transactions', transactions);

const nodeLookup = (req: Request, res: Response, next: NextFunction) => {
  const {nodeId} = req.params;
  const node = config[nodeId];

  if (node?.online()) {
    req.node = node;
    next();
  }

  res.status(500).send();
};

app.use(express.json());

app.use('/:nodeId', nodeLookup);

app.use('/:nodeId/internal-api', internalApi);
app.use('/:nodeId/api', servers);

export default app;
