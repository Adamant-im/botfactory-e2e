import axios from 'axios';
import {
  AdamantAddress,
  KeyPair,
  MessageType,
  createAddressFromPublicKey,
  createChatTransaction,
  createSendTransaction,
  encodeMessage,
} from 'adamant-api';

import {TestBot} from '../bot/index.js';
import {Action, ActionsQueue} from './queue.js';
import {ProcessedTransaction} from '../node/node.js';

export interface UserAccount {
  keyPair: KeyPair;
}

type SendsCommandOptions = {
  command: string;
  args?: string[];
};

type SendsOptions =
  | {
      message: string;
      amount?: number;
    }
  | SendsCommandOptions;

type TransfersAmount = number | [amount: number, crypto: string];

type TransfersOptions = {
  message?: string;
  hash?: string;
  text_fallback?: string;
};

const buildCommandMessage = (options: SendsCommandOptions) => {
  let message = `/${options.command}`;

  if (options.args) {
    message += ` ${options.args.join(' ')}`;
  }

  return message;
};

export class UserControls extends ActionsQueue {
  /**
   * Bot to trigger `bot.handle()` method.
   */
  private _bot?: TestBot;

  /**
   * User's key pair.
   */
  private keyPair: KeyPair;
  /**
   * User's ADAMANT address.
   */
  private address: AdamantAddress;

  constructor(keyPair: KeyPair) {
    super();

    const address = createAddressFromPublicKey(keyPair.publicKey);

    this.keyPair = keyPair;
    this.address = address;
  }

  get bot() {
    const bot = this._bot;

    if (!bot) {
      throw new Error('No bot was set');
    }

    return bot;
  }

  set bot(bot: TestBot) {
    this._bot = bot;
  }

  /**
   * Sets a bot that user shall interact with.
   */
  interactsWith(bot: TestBot) {
    return this.enqueue(async () => {
      bot.node.mockAccount(this.keyPair);

      this.bot = bot;
    });
  }

  /**
   * Waits for a bot's response to the user
   */
  shouldReceive(callback: (tx: ProcessedTransaction) => void) {
    return this.enqueue(() => {
      return new Promise(resolve => {
        const {bot} = this;

        bot.node.once(this.address, tx => {
          callback(tx);
          resolve();
        });
      });
    });
  }

  /**
   * Creates a **chat** transaction within the user's key pair that is processed by
   * a fake node connected to bot, then forces the bot to handle the processed transaction.
   */
  sends(options: SendsOptions) {
    return this.enqueue(async () => {
      const {bot, keyPair} = this;

      const message =
        'command' in options ? buildCommandMessage(options) : options.message;

      const {message: encodedMessage, own_message} = this.encode(message);

      const transaction = createChatTransaction({
        recipientId: bot.address,
        message_type: MessageType.Chat,
        message: encodedMessage,
        own_message,
        keyPair,
      });

      const {data} = await axios.post(
        `${bot.node.url}/internal-api/chats/process`,
        {
          transaction,
        }
      );

      bot.handle(data.transaction);
    });
  }

  /**
   * Creates a **transfer** transaction within the user's key pair that is processed by
   * a fake node connected to bot, then forces the bot to handle the processed transaction.
   */
  transfers(transfersAmount: TransfersAmount, options: TransfersOptions = {}) {
    return this.enqueue(async () => {
      const {bot, keyPair} = this;

      const amount =
        typeof transfersAmount === 'number'
          ? transfersAmount
          : transfersAmount[0];

      const token =
        typeof transfersAmount === 'number'
          ? 'ADM'
          : transfersAmount[1].toUpperCase();

      if (token === 'ADM') {
        const transaction = createSendTransaction({
          recipientId: bot.address,
          amount,
          keyPair,
        });

        const {data} = await axios.post(
          `${bot.node.url}/internal-api/chats/process`,
          {
            transaction,
          }
        );

        bot.handle(data.transaction);
      } else {
        const {message: encodedMessage, own_message} = this.encode(
          JSON.stringify({
            type: `${token}_transaction`,
            amount,
            comments: options.message,
          })
        );

        const transaction = createChatTransaction({
          recipientId: bot.address,
          message_type: MessageType.Rich,
          message: encodedMessage,
          own_message,
          keyPair,
        });

        const {data} = await axios.post(
          `${bot.node.url}/internal-api/chats/process`,
          {
            transaction,
          }
        );

        bot.handle(data.transaction);
      }
    });
  }

  then(onFullFiled: Action) {
    return this.enqueue(onFullFiled);
  }

  private encode(message: string) {
    return encodeMessage(message, this.keyPair, this.bot.publicKey);
  }
}
