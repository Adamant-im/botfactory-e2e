import {copyBot, type Bot} from 'adamant-botfactory';
import {Node} from '../node/node.js';
import {ChatMessageTransaction} from 'adamant-api';

const DEFAULT_PASSPHRASE =
  'apple banana cherry date elderberry fig grape hazelnut iris juniper kiwi lemon';

export type NodesOptions =
  | {
      node: Node;
      nodes?: never;
    }
  | {
      nodes: Node[];
      node?: never;
    };

export type TestBotOptions = NodesOptions & {
  passphrase?: string;
};

interface NodeMap {
  [nodeURL: string]: Node;
}

export class TestBot {
  bot: Bot;

  nodes: NodeMap;

  constructor(bot: Bot, options: TestBotOptions) {
    const passphrase = options.passphrase || DEFAULT_PASSPHRASE;

    const nodes = options.nodes || [options.node];

    const nodesUrl = nodes.map(node => node.url);
    this.bot = copyBot(bot)(passphrase, {
      nodes: nodesUrl,
    });

    this.nodes = {};
    for (const node of nodes) {
      node.mockAccount(this.bot.keyPair);
      this.nodes[node.url] = node;
    }
  }

  get address() {
    return this.bot.address;
  }

  get node() {
    return this.nodes[this.bot.node];
  }

  get publicKey() {
    return this.bot.keyPair.publicKey;
  }

  handle(transaction: ChatMessageTransaction) {
    return this.bot.handleTransaction(transaction);
  }
}

export const createTestBot = (bot: Bot, options: TestBotOptions): TestBot => {
  return new TestBot(bot, options);
};
