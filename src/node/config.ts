import {Node} from './node.js';

export interface NodesConfig {
  [nodeId: string]: Node;
}

export const config: NodesConfig = {};
