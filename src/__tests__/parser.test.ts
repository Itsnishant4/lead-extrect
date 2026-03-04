import { describe, it, expect } from 'vitest';
import { parseMapResponse, Lead } from '@/lib/parser';

describe('parseMapResponse', () => {
  it('returns empty array for null/undefined input', () => {
    expect(parseMapResponse(null)).toEqual([]);
    expect(parseMapResponse(undefined)).toEqual([]);
  });

  it('returns empty array when data[0][1] is not an array', () => {
    expect(parseMapResponse([[null]])).toEqual([]);
    expect(parseMapResponse([[{ not: 'array' }]])).toEqual([]);
  });

  it('returns empty array for empty results', () => {
    expect(parseMapResponse([[[]]])).toEqual([]);
  });

  it('skips items with less than 15 elements', () => {
    const data = [[[
      [1, 2, 3], // Too short
    ]]];
    expect(parseMapResponse(data)).toEqual([]);
  });

  it('skips items without bizData at index 14', () => {
    const item = new Array(15).fill(null);
    item[14] = null;
    const data = [[null, [item]]];
    expect(parseMapResponse(data)).toEqual([]);
  });

  it('parses a valid lead with name', () => {
    const bizData = new Array(200).fill(null);
    bizData[11] = 'Test Business';
    bizData[39] = '123 Main St, City, State 12345, India';
    bizData[7] = ['https://example.com'];
    bizData[178] = [['+91-9876543210']];
    bizData[4] = [null, null, null, null, null, null, null, 4.5, 120];
    bizData[13] = ['Restaurant'];
    bizData[78] = 'ChIJ_test123';
    bizData[9] = [null, null, 23.0225, 72.5714];

    const item = new Array(15).fill(null);
    item[14] = bizData;

    const data = [[null, [item]]];
    const result = parseMapResponse(data);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test Business');
    expect(result[0].address).toBe('123 Main St, City, State 12345, India');
    expect(result[0].website).toBe('https://example.com');
    expect(result[0].phone).toBe('+91-9876543210');
    expect(result[0].rating).toBe(4.5);
    expect(result[0].reviewsCount).toBe(120);
    expect(result[0].category).toBe('Restaurant');
    expect(result[0].placeId).toBe('ChIJ_test123');
    expect(result[0].latitude).toBe(23.0225);
    expect(result[0].longitude).toBe(72.5714);
    expect(result[0].directionUrl).toBe('https://www.google.com/maps/dir//23.0225,72.5714');
  });

  it('falls back to name at index 18 when index 11 is null', () => {
    const bizData = new Array(200).fill(null);
    bizData[11] = null;
    bizData[18] = 'Fallback Name';

    const item = new Array(15).fill(null);
    item[14] = bizData;

    const data = [[null, [item]]];
    const result = parseMapResponse(data);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Fallback Name');
  });

  it('skips items without any name', () => {
    const bizData = new Array(200).fill(null);
    bizData[11] = null;
    bizData[18] = null;

    const item = new Array(15).fill(null);
    item[14] = bizData;

    const data = [[null, [item]]];
    const result = parseMapResponse(data);
    expect(result).toHaveLength(0);
  });

  it('parses city from Indian-style address', () => {
    const bizData = new Array(200).fill(null);
    bizData[11] = 'Test';
    bizData[39] = 'Shop 5, MG Road, Ahmedabad, Gujarat 380001, India';

    const item = new Array(15).fill(null);
    item[14] = bizData;
    const data = [[null, [item]]];
    const result = parseMapResponse(data);

    // Parser logic: last part is 'India', so city is parts[length-3]
    expect(result[0].city).toBe('Ahmedabad');
  });

  it('handles missing address gracefully', () => {
    const bizData = new Array(200).fill(null);
    bizData[11] = 'Test';
    bizData[39] = null;

    const item = new Array(15).fill(null);
    item[14] = bizData;
    const data = [[null, [item]]];
    const result = parseMapResponse(data);

    expect(result[0].city).toBeNull();
    expect(result[0].address).toBeNull();
  });

  it('parses social links from bizData[12]', () => {
    const bizData = new Array(200).fill(null);
    bizData[11] = 'Social Biz';
    bizData[12] = [
      ['https://www.facebook.com/testbiz'],
      ['https://www.instagram.com/testbiz'],
      ['mailto:info@test.com'],
    ];

    const item = new Array(15).fill(null);
    item[14] = bizData;
    const data = [[null, [item]]];
    const result = parseMapResponse(data);

    expect(result[0].socials?.facebook).toBe('https://www.facebook.com/testbiz');
    expect(result[0].socials?.instagram).toBe('https://www.instagram.com/testbiz');
    expect(result[0].email).toBe('info@test.com');
  });

  it('handles multiple leads in one response', () => {
    const makeBizItem = (name: string) => {
      const bizData = new Array(200).fill(null);
      bizData[11] = name;
      const item = new Array(15).fill(null);
      item[14] = bizData;
      return item;
    };

    const data = [[null, [
      makeBizItem('Business A'),
      makeBizItem('Business B'),
      makeBizItem('Business C'),
    ]]];

    const result = parseMapResponse(data);
    expect(result).toHaveLength(3);
    expect(result.map(l => l.name)).toEqual(['Business A', 'Business B', 'Business C']);
  });
});
