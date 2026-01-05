import { afterAll, beforeAll } from 'vitest';
import { version } from '../package.json';

beforeAll(() => {
  // @ts-ignore
  globalThis.VERSION = version;
});

afterAll(() => {
  // @ts-ignore
  delete globalThis.VERSION;
});
