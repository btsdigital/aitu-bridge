export function createCounter(prefix = 'm:') {
    let current = 0;

    return {
        next() {
            return prefix + ++current;
        },
    };
}