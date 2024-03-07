import {createFakeNode, createFakeUser} from 'adamant-botfactory-e2e';
import {bot} from '../bot.js';

let node: Node;

beforeEach(() => {
  // Clear the node data before each test
  node = createMockNode('config-commands-test', {
    version: '0.6.0',
  });
});

it('should greet the users with their address', async () => {
  const testBot = createTestBot(bot, {
    nodes,
  });

  const user = createFakeUser('my passphrase');

  await user.interactsWith(testBot);
  await user.sends({command: 'start'});

  const {message} = await user.shouldReceive();

  await createFakeUser('my passphrase')
    .interactsWith(testBot)
    .sends({
      command: 'start',
    })
    .shouldReceive(({message}) => {
      expect(message).toBe('Welcome to test bot');
    })
    .transfers([0.5, 'BTC'], {
      withMessage: 'Take it',
    })
    .shouldReceive(({message}) => {
      expect(message).toBe('Thanks for the donation!');
    });
});
