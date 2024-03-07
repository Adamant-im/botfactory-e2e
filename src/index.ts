// import {UserControls} from './user/controls';
// import {FakeUser} from './user/fake-user';

// export function createFakeUser(passphrase: string) {
//   const user = new FakeUser(passphrase);
//   return new UserControls(user);
// }

export {createMockNode} from './node/index.js';
export {createTestBot} from './bot/index.js';
export {createFakeUser} from './user/index.js';
