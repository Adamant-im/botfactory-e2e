import {AdamantAddress} from 'adamant-api';
import {type ProcessedTransaction} from './node.js';

type EventHandler = (tx: ProcessedTransaction) => void;

interface EventHandlers {
  [address: string]: EventHandler[];
}

export class NodeEventListener {
  handlers: EventHandlers;

  constructor() {
    this.handlers = {};
  }

  once(address: AdamantAddress, handler: EventHandler) {
    if (!this.handlers[address]) {
      this.handlers[address] = [];
    }

    this.handlers[address].push(handler);
  }

  handle(transaction: ProcessedTransaction) {
    const address = transaction.recipientId;
    const handlers = this.handlers[address];

    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(transaction);
    }

    this.handlers[address] = [];
  }
}
