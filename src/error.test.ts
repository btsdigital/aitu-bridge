import { classifyBridgeError, BridgeErrors } from './error';

import { describe, it, expect } from 'vitest';

describe('Errors', () => {
  it('should return BridgeErrors.PermissionDenyError when message starts with "permission deny"', () => {
    const result = classifyBridgeError({ msg: 'permission deny: user cannot do X' });
    expect(result).toBe(BridgeErrors.PermissionDenyError);
  });

  it('should return BridgeErrors.PermissionSecurityDenyError when message starts with "permission security deny"', () => {
    const result = classifyBridgeError({ msg: 'permission security deny: restricted' });
    expect(result).toBe(BridgeErrors.PermissionSecurityDenyError);
  });

  it('should return BridgeErrors.OtherError in otherwise', () => {
    const resultA = classifyBridgeError('some random other error');
    const resultB = classifyBridgeError(123);
    const resultC = classifyBridgeError({ msg: 'Random error' });

    expect(resultA).toBe(BridgeErrors.OtherError);
    expect(resultB).toBe(BridgeErrors.OtherError);
    expect(resultC).toBe(BridgeErrors.OtherError);
  });
});
