# ADAMANT Botfactory E2E

`botfactory-e2e` is an independent testing framework for [adamant-botfactory](https://github.com/adamant-im/adamant-botfactory) that uses [Fluent interface](https://en.wikipedia.org/wiki/Fluent_interface).

## Installation

To use this framework, you would need to install `botfactory-e2e` via your favorite package manager, e.g. `npm`:

```js
npm install botfactory-e2e
```

For a better experience, you may also want to install another testing framework. This documentation uses [`Jest`](https://github.com/jestjs/jest) in its examples, but you can use any other testing framework you prefer.

## Getting Started

Let's get started by writing a test for a hypothetical bot that greetings a user. First, create a `bot.js` file:

```js
import {createBot} from 'adamant-botfactory';

const bot = createBot(process.env.PASSPHRASE, {
  nodes: [
    /* ... */
  ],
});

bot.command('start', usr => usr.reply(`Hello, ${usr.address}!`));

export {bot};
```

As you can see, we don't start the bot in the same file as we create it because it would interfere with our tests. You might want to create a separate file named `start.js` to run the bot.

Then, create a file named `bot.test.js`. This will contain our actual test:

```js
import {createTestBot, createMockNode} from 'botfactory-e2e';
import {bot} from './bot.js';

const node = createMockNode('my-test-node');

describe('Greeting Bot', () => {
  const testBot = createTestBot(bot, {node});

  it('should greet a user with the correct address', done => {
    const passphrase =
      'angry special raise embark animal you ball million bronze science crater review';
    const user = createFakeUser(passphrase);

    user
      .interactsWith(testBot)
      .sends({command: 'start'})
      .shouldReceive(({message}) =>
        expect(message.text).toBe('Hello, U14581577999389437648!')
      )
      .then(done);
  });
});

afterAll(() => {
  node.shutdown();
});
```

There's much going on, so let's break this test down line by line. Firstly, we need to create a fake node:

```js
const node = createMockNode('my-test-node');
```

This will start a local server to fake an ADAMANT node with mock responses. We must pass a unique id for the fake node to separate it from others and allow for future reuse.

Next, we create a test bot:

```js
const testBot = createTestBot(bot, {node});
```

What it does is simply make a copy of the bot with a mock passphrase and connect it to the fake node we created earlier.

Finally, we can create an interface to test the bot using mock user:

```js
const user = createFakeUser(passphrase);
```

Now, as we ready, we can tell the mock user which bot it should interact with:

```js
user.interactsWith(testBot);
```

Then, we are going to test `start` command, so we generate and send a mock message to the bot with the `/start` command:

```js
user.sends({command: 'start'});
```

To test the bot's response, we can use Jest's built-in assertion function inside the `shouldReceive` method's callback. First argument of the callback is the next transaction our bot will send to the user:

```js
user.shouldReceive(({message}) =>
  expect(message.text).toBe('Hello, U14581577999389437648!')
);
```

As we finish the testing, we can let Jest know that we're done:

```js
user.then(done);
```

## Usage

### async/await

You can use `await` with the mock user instance as it's a [thenable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) class:

```js
await user.interactsWith(myBot);
await user.sends({message: 'Hello!'});
```

### Mock Nodes

A mock node is a fake ADAMANT Node that doesn't perform any calculations but returns mock data, which you are free to modify.

When creating your first mock node, `botfactory-e2e` will try to find a free port starting from `36668`. Once it finds a free port, it will create a single server for all the features of the mock nodes:

```js
const node1 = createMockNode('first-node');
console.log(node1.url); // http://localhost:36668/first-node

const node2 = createMockNode('second-node');
console.log(node2.url); // http://localhost:36668/second-node
```

When creating a mock node, you must specify the fake node's ID, which you can use to clear the old node's data and reuse it:

```js
let node;

beforeEach(() => {
  node = createMockNode('test-node');
});
```

Then, you can pass the created nodes into `createTestBot`:

```js
const testBot = createTestBot(bot, {
  nodes: [node1, node2],
});

// Or for a single node, you can use

const testBot = createTestBot(bot, {
  node: node1,
});
```

### Test bot

Test bot simply copies all the handlers from your bot and connects it with the fake nodes you provided, adding its keypair to the fake nodes data:

```js
const testBot = createTestBot(bot, {
  node,
  passphrase:
    'apple banana cherry date elderberry fig grape hazelnut iris juniper kiwi lemon',
});

const {publicKey} = node.getAccount(testBot.address);

// db299bb7fd288b387b0b94b539e2689c46f980ea7cfa0a53a26842f84f3c32bf
console.log(publicKey);
```

### Fake users

To interact with your bot, you can use fake user.

```js
user
  .interactsWith(testBot)
  .sends({command: 'start'})
  .shouldReceive(({message}) =>
    expect(message.text).toBe('Hello, U14581577999389437648!')
  )
  .then(done);
```
