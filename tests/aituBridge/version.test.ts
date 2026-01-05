import { beforeAll, describe, expect, it } from 'vitest';
import type { AituBridge } from '../../src/types';
import { version } from '../../package.json';

describe('aituBridge.version', () => {
  let aituBridge: AituBridge;

  beforeAll(async () => {
    aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());
  });

  it('should satisfy package.json version', () => {
    expect(aituBridge.version).toBe(version);
  });
});
