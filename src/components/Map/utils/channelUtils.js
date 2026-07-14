export const normalizeChannels = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value.filter(Boolean);

  return [value].filter(Boolean);
};
