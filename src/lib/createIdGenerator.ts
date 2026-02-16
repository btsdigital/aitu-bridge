export const createIdGenerator = () => {
  const counters: Record<string, number> = {};

  return (key: string): string => {
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    return `${key}:${next}`;
  };
};
