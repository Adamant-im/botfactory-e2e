import {node, createFakeUser} from 'adamant-botfactory-e2e';
import {bot} from '../bot.js';

const nodeVersion = 'v0.6.0';

beforeAll(() => {
  node.version(nodeVersion);
});

it('should greet the users with their address', done => {
  const user = createFakeUser('my passphrase', {node});

  user
    .interactsWith(bot)
    .sends({command: 'start'})
    .shouldReceive(({message}) => {
      expect(message).toBe(
        `Hello, ${user}. I am an example bot, I am connected to node ${nodeVersion}`
      );
    })
    .then(done);
});
