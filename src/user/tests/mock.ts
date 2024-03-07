import {Bot} from 'adamant-botfactory';

/**
 * Creates non-blocking mock adamant-botfactory bot with empty nodes list
 */
export const createMockBot = (passphrase: string) =>
  new Bot(passphrase, {
    nodes: [],
    checkHealthAtStartup: false,
  });
