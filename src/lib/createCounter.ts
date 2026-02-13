export type Counter = {
    next(): string;
}

export function createCounter(prefix = 'm:'): Counter {
    let current = 0;

    return {
        next(): string {
            return prefix + ++current;
        },
    };
}