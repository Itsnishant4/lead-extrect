import { describe, it, expect } from 'vitest';
import {
  generateCsv,
  sanitizePhoneList,
  sanitizeEmailList,
  firstEmail,
} from '@/lib/export-utils';

// Mirrors the broken Dentist UK row: comma-joined multi-number Website Phone
// plus cross-country junk fragments.
const BROKEN_UK_LEAD = {
  name: 'Bridge St Aesthetic and Dental Implant Clinic Aberdeen',
  category: 'Dentist',
  rating: 4.6,
  reviewsCount: 1797,
  phone: '+44 1224 588477',
  websitePhone: '+911224588477, +917404761807, +492372351, +911774483200, +911774396800',
  email: 'info.bridgestdental@gmail.com',
  websiteEmail: 'info.bridgestdental@gmail.com, yourdentalimplantcentre@gmail.com',
  website: 'https://www.bridgestdental.co.uk/',
  address: '24-28 Bridge St, Aberdeen AB11 6JJ, United Kingdom',
  city: 'Aberdeen AB11 6JJ',
  latitude: 57.1448993,
  longitude: -2.1015878999999997,
  placeId: 'ChIJI8k0siQOhEgRhpKd1Zhiu5g',
  facebook: null, instagram: null, linkedin: null, twitter: null,
  youtube: null, pinterest: null, tiktok: null,
  mondayHours: null, tuesdayHours: null, wednesdayHours: null,
  thursdayHours: null, fridayHours: null, saturdayHours: null, sundayHours: null,
};

describe('export phone/email sanitize', () => {
  it('keeps E164 numbers, joins with semicolons', () => {
    expect(sanitizePhoneList('+911224588477, +917404761807')).toBe(
      '+911224588477; +917404761807'
    );
  });

  it('drops fragments and caps at 3', () => {
    expect(sanitizePhoneList('+44 1224 588477')).toBe('');
    expect(
      sanitizePhoneList('+441224588477,+442071234567,+443334445555,+444445556666')
    ).toBe('+441224588477; +442071234567; +443334445555');
  });

  it('splits comma emails and picks first valid', () => {
    expect(sanitizeEmailList('a@x.com, b@y.org')).toBe('a@x.com; b@y.org');
    expect(firstEmail({ email: null, websiteEmail: 'a@x.com, b@y.org' })).toBe('a@x.com');
    expect(firstEmail({ email: null, websiteEmail: null })).toBe(null);
  });
});

describe('generateCsv structure', () => {
  it('keeps all 30 columns aligned on garbage input', () => {
    const csv = generateCsv([BROKEN_UK_LEAD], true, true);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0].split(',')).toHaveLength(30);

    // Parse back with a real CSV parser mindset: Website Phone one cell
    const row = lines[1];
    expect(row).toContain(
      "'+911224588477; +917404761807; +492372351"
    );
    // Email stays in Email column (semicolon-joined)
    expect(row).toContain('info.bridgestdental@gmail.com; yourdentalimplantcentre@gmail.com');
    // Numerics raw, never '-prefixed
    expect(row).toContain(',4.6,1797,');
    expect(row).toContain(',57.1448993,-2.1015878999999997,');
    // Website untouched in its column
    expect(row).toContain('https://www.bridgestdental.co.uk/');
  });

  it('formula-guard still protects text fields', () => {
    const csv = generateCsv([{ ...BROKEN_UK_LEAD, name: '=cmd|test' }], false, false);
    expect(csv.split('\n')[1]).toContain("'=cmd|test");
  });
});
