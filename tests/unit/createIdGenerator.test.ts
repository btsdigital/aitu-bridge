import { describe, it, expect } from 'vitest';
import { createIdGenerator } from '../../src/lib/createIdGenerator';

describe('createIdGenerator', () => {
  it('increments counter for the same key', () => {
    const gen = createIdGenerator();

    expect(gen('foo')).toBe('foo:1');
    expect(gen('foo')).toBe('foo:2');
    expect(gen('foo')).toBe('foo:3');
  });

  it('maintains independent counters for different keys', () => {
    const gen = createIdGenerator();

    expect(gen('a')).toBe('a:1');
    expect(gen('b')).toBe('b:1');
    expect(gen('a')).toBe('a:2');
    expect(gen('b')).toBe('b:2');
  });

  it('different generator instances do not share state', () => {
    const g1 = createIdGenerator();
    const g2 = createIdGenerator();

    expect(g1('k')).toBe('k:1');
    expect(g1('k')).toBe('k:2');

    expect(g2('k')).toBe('k:1');
    expect(g2('k')).toBe('k:2');
  });
});
