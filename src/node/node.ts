import {
  AdamantAddress,
  MessageType,
  TransactionType,
  getTransactionId,
  fees,
  KeyPair,
  createAddressFromPublicKey,
} from 'adamant-api';

import {NodeEventListener} from './events.js';

const START_TIMESTAMP = 58000000;
const START_HEIGHT = 36900000;
const TIMESTAMP_STEP = 25;
const HEIGHT_STEP = 5;

/**
 * If we would set default confirmations to 0 then
 * every new transaction would not be processed by bots.
 */
const DEFAULT_CONFIRMATIONS = 5;

interface Account {
  /**
   * ADAMANT address.
   */
  address: AdamantAddress;
  /**
   * Account's key pair.
   */
  keyPair: KeyPair;
  /**
   * Public key in hex representation.
   */
  publicKey: string;
  balance?: {
    balance: string;
    unconfirmedBalance: string;
  };
}

export interface ChatTransaction {
  signature: string;
  recipientId: `U${string}`;
  amount: number;
  asset: {
    chat: {
      message: string;
      own_message: string;
      type: MessageType;
    };
  };
  type: TransactionType.CHAT_MESSAGE;
  timestamp: number;
  senderPublicKey: string;
  senderId: AdamantAddress;
}

export interface ProcessedTransaction extends ChatTransaction {
  height: number;
  id: string;
  recipientPublicKey: string;
  fee: number;
  signatures: never[];
}

export interface CreateNodeOptions {
  online?: boolean;
  timestamp?: number;
}

export interface NodeOptions extends CreateNodeOptions {
  port: number;
  id: string;
}

interface ConnectedAccounts {
  [address: string]: Account;
}

interface TransactionMap {
  [transactionId: string]: ProcessedTransaction;
}

const defaultConfig = {
  online: true,
  timestamp: START_TIMESTAMP,
  height: START_HEIGHT,
};

export class Node extends NodeEventListener {
  /**
   * URL of the node in format 'http://localhost:PORT/node-id'
   */
  public url: string;
  /**
   * Node ID given by a user.
   */
  public id: string;

  /**
   * Mock data for ADAMANT accounts, e.g. `publicKey`, `balance`, etc.
   */
  private accounts: ConnectedAccounts;
  /**
   * Fake transactions storage.
   */
  private transactions: TransactionMap;

  /**
   * Whenever the node should process request or respond with 500 HTTP code.
   */
  private _online;
  /**
   * Node mocked timestamp that is not affected by real time.
   */
  private _timestamp;
  /**
   * Node mocked height.
   */
  private _height;

  constructor(options: NodeOptions) {
    super();

    this.id = options.id;

    this.url = `http://localhost:${options.port}/${options.id}`;

    this.accounts = {};
    this.transactions = {};

    const config = {
      ...defaultConfig,
      options,
    };

    this._online = config.online;
    this._timestamp = config.timestamp;
    this._height = config.height;
  }

  /**
   * Returns different timestamp every time while keeping predictability.
   */
  get timestamp() {
    this._timestamp += TIMESTAMP_STEP;

    return this._timestamp;
  }

  get height() {
    this._height += HEIGHT_STEP;

    return this._height;
  }

  /**
   * Sets status of the node.
   */
  online(isOnline: boolean): void;
  /**
   * Returns status of the node.
   */
  online(): boolean;
  online(isOnline?: boolean) {
    if (isOnline !== undefined) {
      this._online = isOnline;
    } else {
      return this._online;
    }
  }

  /**
   * Connects an account to the list of known accounts for the node.
   * This information is used by endpoints such as `/getPublicKey`.
   */
  mockAccount(keyPair: KeyPair) {
    const publicKey = keyPair.publicKey.toString('hex');
    const address = createAddressFromPublicKey(keyPair.publicKey);

    this.accounts[address] = {
      keyPair,
      address,
      publicKey,
    };
  }

  /**
   * Retrieves an account from the list of known accounts using its address.
   */
  getAccount(address: string) {
    const account = this.accounts[address];

    if (!account) {
      return null;
    }

    return account;
  }

  /**
   * Returns transaction by its id.
   */
  getTransaction(id: string) {
    const transaction = this.transactions[id];

    return {
      ...transaction,
      confirmations: this.height - transaction.height,
    };
  }

  /**
   * Returns public key of an account by its address.
   *
   * NOTE: You MUST provide account data using {@link mockAccount()} if you are
   * not refering to a bot nor a user that is created via {@link createFakeUser}.
   */
  getPublicKey(id: string) {
    const account = this.accounts[id];

    if (!account) {
      return '';
    }

    return account.publicKey;
  }

  /**
   * Generates a unique id for a transaction and connects it to the current block.
   */
  processChatTransaction(transaction: ChatTransaction) {
    const id = getTransactionId(transaction);

    const processedTransaction = {
      ...transaction,
      height: this.height,
      id,
      block_timestmap: this.timestamp,
      fee: fees.chat_message,
      signatures: [],
      recipientPublicKey: this.getPublicKey(transaction.senderId),
    };

    this.saveChatTransaction(processedTransaction);

    // return transaction with confirmations field
    return this.getTransaction(processedTransaction.id);
  }

  saveChatTransaction(transaction: ProcessedTransaction) {
    this.transactions[transaction.id] = transaction;

    this.handle(transaction);
  }
}
