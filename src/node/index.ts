import {config} from './config.js';
import {Node, CreateNodeOptions} from './node.js';
import server from './server/app.js';

const DEFAULT_PORT = 36668;

/**
 * Starts the nodes server and returns its port.
 */
const startServer = (port: number) => {
  return new Promise<number>(resolve => {
    const onSuccess = () => {
      console.log(`✨ Listening on port http://localhost:${port}`);
      resolve(port);
    };

    const onError = (error: Error & {code?: string}) => {
      if (error.code === 'EADDRINUSE') {
        // try next port if address already in use
        server.listen(++port, onSuccess);
      } else {
        console.error(error);
        server.removeListener('error', onError);
      }
    };

    server.listen(port, onSuccess).on('error', onError);
  });
};

const port = await startServer(DEFAULT_PORT);

export {port};

export const createMockNode = (id: string, options: CreateNodeOptions = {}) => {
  const node = new Node({
    ...options,
    port,
    id,
  });

  config[id] = node;

  return node;
};
