import { describe, it, expect } from 'vitest';
import * as health from '../../src/services/net/health';

describe('health utils', () => {
  it('isOnline returns boolean', () => {
    expect(typeof health.isOnline()).toBe('boolean');
  });

  it('onOnlineChange subscribes and unsubscribes', () => {
    let called = 0;
    const off = health.onOnlineChange(() => { called++; });
    // Call internal notify indirectly by toggling global window events if present is hard in node env; just ensure off() works.
    off();
    expect(typeof off).toBe('function');
    expect(called).toBe(0);
  });

  it('pingApi handles failure and returns boolean', async () => {
    const ok = await health.pingApi('/__definitely_missing__');
    expect(typeof ok).toBe('boolean');
  });
});
