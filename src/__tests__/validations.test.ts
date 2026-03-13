import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  loginSchema,
  otpSchema,
  resetPasswordSchema,
  createTaskSchema,
  createBlogPostSchema,
  updateBlogPostSchema,
  addProxySchema,
  createPlanSchema,
  updatePlanSchema,
  updateSettingSchema,
  saveKeywordHistorySchema,
  generateKeywordsSchema,
  updateBannerSchema,
  updateTaskStatusAdminSchema,
  updateUserCreditsSchema,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  // --- signupSchema ---
  describe('signupSchema', () => {
    it('accepts valid input', () => {
      expect(() => signupSchema.parse({ name: 'John', email: 'john@example.com', password: 'password123' })).not.toThrow();
    });

    it('rejects short name', () => {
      expect(() => signupSchema.parse({ name: 'J', email: 'john@example.com', password: 'password123' })).toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => signupSchema.parse({ name: 'John', email: 'not-email', password: 'password123' })).toThrow();
    });

    it('rejects short password', () => {
      expect(() => signupSchema.parse({ name: 'John', email: 'john@example.com', password: 'short' })).toThrow();
    });

    it('rejects long password', () => {
      expect(() => signupSchema.parse({ name: 'John', email: 'john@example.com', password: 'a'.repeat(101) })).toThrow();
    });
  });

  // --- loginSchema ---
  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      expect(() => loginSchema.parse({ email: 'user@test.com', password: 'x' })).not.toThrow();
    });

    it('rejects empty password', () => {
      expect(() => loginSchema.parse({ email: 'user@test.com', password: '' })).toThrow();
    });
  });

  // --- otpSchema ---
  describe('otpSchema', () => {
    it('accepts valid 6-digit OTP', () => {
      expect(() => otpSchema.parse({ email: 'a@b.com', otp: '123456' })).not.toThrow();
    });

    it('rejects OTP with wrong length', () => {
      expect(() => otpSchema.parse({ email: 'a@b.com', otp: '12345' })).toThrow();
      expect(() => otpSchema.parse({ email: 'a@b.com', otp: '1234567' })).toThrow();
    });
  });

  // --- resetPasswordSchema ---
  describe('resetPasswordSchema', () => {
    it('accepts valid reset input', () => {
      expect(() => resetPasswordSchema.parse({
        email: 'a@b.com', otp: '123456', newPassword: 'newpass12'
      })).not.toThrow();
    });

    it('rejects weak new password', () => {
      expect(() => resetPasswordSchema.parse({
        email: 'a@b.com', otp: '123456', newPassword: 'short'
      })).toThrow();
    });
  });


  // --- createTaskSchema ---
  describe('createTaskSchema', () => {
    it('accepts valid task', () => {
      expect(() => createTaskSchema.parse({ name: 'My Task', keywords: ['keyword1'] })).not.toThrow();
    });

    it('rejects empty keywords array', () => {
      expect(() => createTaskSchema.parse({ name: 'My Task', keywords: [] })).toThrow();
    });

    it('rejects empty task name', () => {
      expect(() => createTaskSchema.parse({ name: '', keywords: ['k'] })).toThrow();
    });
  });

  // --- createBlogPostSchema ---
  describe('createBlogPostSchema', () => {
    it('accepts valid blog post', () => {
      expect(() => createBlogPostSchema.parse({
        slug: 'my-post',
        title: 'My Post',
        content: 'Some content here',
      })).not.toThrow();
    });

    it('accepts full blog post with all optional fields', () => {
      expect(() => createBlogPostSchema.parse({
        slug: 'my-post',
        title: 'My Post',
        content: 'Some content here',
        description: 'A description',
        author: 'Author',
        category: 'Tech',
        read_time: '5 min',
        image_url: 'https://example.com/img.jpg',
        meta_title: 'SEO Title',
        meta_description: 'SEO Description',
        is_published: true,
        published_at: '2026-01-01',
      })).not.toThrow();
    });

    it('rejects empty slug', () => {
      expect(() => createBlogPostSchema.parse({
        slug: '',
        title: 'My Post',
        content: 'Content',
      })).toThrow();
    });

    it('rejects invalid image URL', () => {
      expect(() => createBlogPostSchema.parse({
        slug: 'post',
        title: 'Title',
        content: 'Content',
        image_url: 'not-a-url',
      })).toThrow();
    });
  });

  // --- updateBlogPostSchema ---
  describe('updateBlogPostSchema', () => {
    it('accepts partial update', () => {
      expect(() => updateBlogPostSchema.parse({ title: 'Updated Title' })).not.toThrow();
    });

    it('accepts empty object', () => {
      expect(() => updateBlogPostSchema.parse({})).not.toThrow();
    });
  });

  // --- addProxySchema ---
  describe('addProxySchema', () => {
    it('accepts valid proxy', () => {
      expect(() => addProxySchema.parse({ host: '192.168.1.1', port: 8080 })).not.toThrow();
    });

    it('accepts proxy with auth', () => {
      expect(() => addProxySchema.parse({
        host: 'proxy.example.com', port: 3128,
        username: 'user', password: 'pass',
        protocol: 'socks5',
      })).not.toThrow();
    });

    it('rejects invalid port', () => {
      expect(() => addProxySchema.parse({ host: 'proxy', port: 99999 })).toThrow();
      expect(() => addProxySchema.parse({ host: 'proxy', port: 0 })).toThrow();
    });

    it('rejects invalid protocol', () => {
      expect(() => addProxySchema.parse({ host: 'proxy', port: 80, protocol: 'ftp' })).toThrow();
    });
  });

  // --- createPlanSchema ---
  describe('createPlanSchema', () => {
    it('accepts valid plan', () => {
      expect(() => createPlanSchema.parse({
        name: 'Pro', period: 'monthly', leadsCredits: 1000,
      })).not.toThrow();
    });

    it('accepts full plan with all fields', () => {
      expect(() => createPlanSchema.parse({
        name: 'Enterprise',
        description: 'For large teams',
        price: 99.99,
        discount: 20,
        period: 'yearly',
        leadsCredits: 50000,
        maxConcurrentTasks: 5,
        features: ['Unlimited exports', 'Priority support'],
        unavailableFeatures: [],
        whatsappUrl: 'https://wa.me/1234567890',
        badge: 'Popular',
        sortOrder: 2,
        isActive: true,
      })).not.toThrow();
    });

    it('rejects negative credits', () => {
      expect(() => createPlanSchema.parse({
        name: 'Bad', period: 'monthly', leadsCredits: -100,
      })).toThrow();
    });
  });

  // --- updatePlanSchema ---
  describe('updatePlanSchema', () => {
    it('accepts partial update', () => {
      expect(() => updatePlanSchema.parse({ price: 49.99 })).not.toThrow();
    });
  });

  // --- updateSettingSchema ---
  describe('updateSettingSchema', () => {
    it('accepts valid setting', () => {
      expect(() => updateSettingSchema.parse({ key: 'theme', value: 'dark' })).not.toThrow();
    });

    it('rejects empty key', () => {
      expect(() => updateSettingSchema.parse({ key: '', value: 'anything' })).toThrow();
    });
  });

  // --- saveKeywordHistorySchema ---
  describe('saveKeywordHistorySchema', () => {
    it('accepts valid keyword history', () => {
      expect(() => saveKeywordHistorySchema.parse({
        name: 'My Search',
        niche: 'dentist',
        location: 'Mumbai, Maharashtra, India',
        keywords: ['dentist in Mumbai'],
      })).not.toThrow();
    });

    it('rejects empty keywords array', () => {
      expect(() => saveKeywordHistorySchema.parse({
        name: 'x', niche: 'y', location: 'z', keywords: [],
      })).toThrow();
    });
  });

  // --- generateKeywordsSchema ---
  describe('generateKeywordsSchema', () => {
    it('accepts valid input with city', () => {
      expect(() => generateKeywordsSchema.parse({
        niche: 'dentist', country: 'India', state: 'Gujarat', city: 'Ahmedabad', selectAllCities: false,
      })).not.toThrow();
    });

    it('accepts null city with selectAllCities', () => {
      expect(() => generateKeywordsSchema.parse({
        niche: 'dentist', country: 'India', state: 'Gujarat', city: null, selectAllCities: true,
      })).not.toThrow();
    });
  });

  // --- updateBannerSchema ---
  describe('updateBannerSchema', () => {
    it('accepts valid banner config', () => {
      expect(() => updateBannerSchema.parse({
        enabled: true,
        text: 'Sale!',
        buttonText: 'Buy Now',
        buttonUrl: 'https://example.com',
        bgColor: '#ff0000',
      })).not.toThrow();
    });

    it('rejects invalid button URL', () => {
      expect(() => updateBannerSchema.parse({
        enabled: true, text: 'x', buttonText: 'y', buttonUrl: 'not-a-url', bgColor: '#000',
      })).toThrow();
    });
  });

  // --- updateTaskStatusAdminSchema ---
  describe('updateTaskStatusAdminSchema', () => {
    it('accepts valid input', () => {
      expect(() => updateTaskStatusAdminSchema.parse({ taskId: 1, status: 'completed' })).not.toThrow();
    });

    it('rejects negative taskId', () => {
      expect(() => updateTaskStatusAdminSchema.parse({ taskId: -1, status: 'running' })).toThrow();
    });
  });

  // --- updateUserCreditsSchema ---
  describe('updateUserCreditsSchema', () => {
    it('accepts valid input', () => {
      expect(() => updateUserCreditsSchema.parse({ userId: 1, amount: 100 })).not.toThrow();
    });

    it('accepts negative amount (credit deduction)', () => {
      expect(() => updateUserCreditsSchema.parse({ userId: 1, amount: -50 })).not.toThrow();
    });
  });
});
