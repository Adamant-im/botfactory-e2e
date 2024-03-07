import {UserControls} from '../controls';
import {FakeUser} from '../fake-user';
import {createMockBot} from './mock';

describe('UserControls', () => {
  let mockFakeUser: FakeUser;

  beforeEach(() => {
    mockFakeUser = new FakeUser('my fake passphrase for my fake user');
  });

  it('should set bot via user.interactsWith()', async () => {
    const firstBot = createMockBot('passphrase for the first bot');
    const secondBot = createMockBot('passphrase for the second bot');

    const user = new UserControls(mockFakeUser);

    await user.interactsWith(firstBot).promise;
    expect(user.bot).toBe(firstBot);

    await user.interactsWith(secondBot).promise;
    expect(user.bot).toBe(secondBot);
  });
});
