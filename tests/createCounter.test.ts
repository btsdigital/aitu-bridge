import { describe, it, expect } from 'vitest';
import { createCounter } from '../src/createCounter';

describe('createCounter', () => {
    it('should return an object with a next method', () => {
        const counter = createCounter();
        expect(counter).toHaveProperty('next');
        expect(typeof counter.next).toBe('function');
    });

    it('should increment and return with default prefix', () => {
        const counter = createCounter();
        expect(counter.next()).toBe('m:1');
        expect(counter.next()).toBe('m:2');
        expect(counter.next()).toBe('m:3');
    });

    it('should use custom prefix', () => {
        const counter = createCounter('id:');
        expect(counter.next()).toBe('id:1');
        expect(counter.next()).toBe('id:2');
    });

    it('should maintain separate state for different instances', () => {
        const counter1 = createCounter('a:');
        const counter2 = createCounter('b:');
        
        expect(counter1.next()).toBe('a:1');
        expect(counter2.next()).toBe('b:1');
        expect(counter1.next()).toBe('a:2');
        expect(counter2.next()).toBe('b:2');
    });

    it('should work with empty prefix', () => {
        const counter = createCounter('');
        expect(counter.next()).toBe('1');
        expect(counter.next()).toBe('2');
    });
});