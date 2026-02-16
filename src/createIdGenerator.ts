export const createIdGenerator = () => {
  const counters: Record<string, number> = {};

  return (type: string): string => {
    const next = (counters[type] ?? 0) + 1;
    counters[type] = next;
    return `${type}:${next}`;
  };
};
