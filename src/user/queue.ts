export type Action = () => void | Promise<void>;

export class ActionsQueue {
  private queue: Promise<void>;

  constructor() {
    this.queue = Promise.resolve();
  }

  /**
   * Adds an action to the queue.
   */
  enqueue(action: Action) {
    this.queue = this.queue.then(action);
    return this;
  }
}
