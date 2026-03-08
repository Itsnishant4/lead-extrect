import { z } from 'zod';

// --- Auth ---

export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(100),
});

// --- Leads ---

export const searchLeadsSchema = z.object({
  query: z.string().min(1).max(500),
  taskId: z.number().optional(),
  forceStore: z.boolean().optional(),
});

// --- Tasks ---

export const createTaskSchema = z.object({
  name: z.string().min(1).max(100),
  keywords: z.array(z.string().min(1)).min(1).max(1000),
});

// --- Blog ---

export const createBlogPostSchema = z.object({
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  description: z.string().max(1000).optional(),
  content: z.string().min(1),
  author: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  read_time: z.string().max(50).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  meta_title: z.string().max(300).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  is_published: z.boolean().optional(),
  published_at: z.string().optional().nullable(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

// --- Proxies ---

export const addProxySchema = z.object({
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  username: z.string().max(255).optional().nullable(),
  password: z.string().max(255).optional().nullable(),
  protocol: z.enum(['http', 'https', 'socks4', 'socks5']).optional(),
  is_active: z.boolean().optional(),
});

// --- Plans ---

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).max(100).optional(),
  period: z.string().min(1).max(50),
  leadsCredits: z.number().int().min(0),
  maxConcurrentTasks: z.number().int().min(1).optional(),
  features: z.array(z.string()).optional(),
  unavailableFeatures: z.array(z.string()).optional(),
  whatsappUrl: z.string().url().optional().nullable().or(z.literal('')),
  badge: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

// --- Settings ---

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});

// --- Keywords ---

export const saveKeywordHistorySchema = z.object({
  name: z.string().min(1).max(200),
  niche: z.string().min(1).max(200),
  location: z.string().min(1).max(300),
  keywords: z.array(z.string()).min(1),
  totalKeywords: z.number().int().optional(),
  truncated: z.boolean().optional(),
});

export const generateKeywordsSchema = z.object({
  niche: z.string().min(1).max(200),
  country: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  city: z.string().max(100).nullable(),
  selectAllCities: z.boolean(),
});

// --- Banner ---

export const updateBannerSchema = z.object({
  enabled: z.boolean(),
  text: z.string().min(1).max(500),
  buttonText: z.string().min(1).max(100),
  buttonUrl: z.string().url(),
  bgColor: z.string().min(1).max(50),
  countdownEnd: z.string().optional(),
});

// --- Admin ---

export const updateTaskStatusAdminSchema = z.object({
  taskId: z.number().int().positive(),
  status: z.string().min(1).max(50),
});

export const updateUserCreditsSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number().int(),
});
