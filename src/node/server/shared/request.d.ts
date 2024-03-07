import {Node} from '../../node.js';
declare global {
  namespace Express {
    export interface Request {
      node: Node;
    }
  }
}
