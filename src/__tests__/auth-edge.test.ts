import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockJwtVerify = vi.fn();

// Mock jose
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(function(this: any, payload: any) {
    this.payload = payload;
    this.setProtectedHeader = () => this;
    this.setIssuedAt = () => this;
    this.setExpirationTime = () => this;
    this.sign = () => Promise.resolve('mocked-jwt-token');
    return this;
  }),
  jwtVerify: (...args: any[]) => mockJwtVerify(...args),
}));

// Import after mocking
import { signToken, verifyToken } from '@/lib/auth-edge';

describe('auth-edge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJwtVerify.mockResolvedValue({
      payload: { id: 'user-123', email: 'test@example.com' },
    });
  });

  describe('signToken', () => {
    it('throws without id', async () => {
      await expect(signToken({ email: 'test@test.com' } as any)).rejects.toThrow(
        'Token payload must include id and email'
      );
    });

    it('throws without email', async () => {
      await expect(signToken({ id: '123' } as any)).rejects.toThrow(
        'Token payload must include id and email'
      );
    });

    it('returns a token when both id and email are provided', async () => {
      const payload = { id: 123, email: 'test@example.com', name: 'Test' };
      const token = await signToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyToken', () => {
    it('returns null for invalid token', async () => {
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));
      const result = await verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    it('returns payload for valid token', async () => {
      const payload = { id: 'user-123', email: 'test@example.com' };
      mockJwtVerify.mockResolvedValue({ payload });
      const result = await verifyToken('valid-token');
      expect(result).toEqual(payload);
    });
  });
});
