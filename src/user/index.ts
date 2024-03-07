import {KeyPair} from 'adamant-api';
import {UserControls} from './controls.js';

export const createFakeUser = (keyPair: KeyPair) => new UserControls(keyPair);
