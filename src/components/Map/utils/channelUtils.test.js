import { normalizeChannels } from './channelUtils';

describe('normalizeChannels', () => {
  it('wraps a single string channel in an array', () => {
    expect(normalizeChannels('Skyline')).toEqual(['Skyline']);
  });

  it('keeps existing arrays intact', () => {
    expect(normalizeChannels(['Skyline', 'RKA'])).toEqual(['Skyline', 'RKA']);
  });

  it('returns an empty array for empty values', () => {
    expect(normalizeChannels(undefined)).toEqual([]);
    expect(normalizeChannels('')).toEqual([]);
  });
});
