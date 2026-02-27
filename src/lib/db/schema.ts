import { pgTable, serial, text, integer, boolean, timestamp, real, unique, index, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false),
  isSuspended: boolean('is_suspended').default(false),
  planType: text('plan_type').default('free'),
  leadsExtracted: integer('leads_extracted').default(0),
  bonusCredits: integer('bonus_credits').default(0),
  subscriptionExpiry: timestamp('subscription_expiry'),
  otpCode: text('otp_code'),
  otpExpiry: timestamp('otp_expiry', { withTimezone: true }),
  otpAttempts: integer('otp_attempts').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  status: text('status').default('pending'),
  totalKeywords: integer('total_keywords').default(0),
  currentKeywordIndex: integer('current_keyword_index').default(0),
  totalLeads: integer('total_leads').default(0),
  keywords: jsonb('keywords'),
  userAgent: text('user_agent'),
  acceptLanguage: text('accept_language'),
  lastLogsSentAt: timestamp('last_logs_sent_at').defaultNow(),
  lastHeartbeat: timestamp('last_heartbeat').defaultNow(),
  exportFileIds: text('export_file_ids'),
  exportStatus: text('export_status'),
  exportCreatedAt: timestamp('export_created_at'),
  exportedLeadsCount: integer('exported_leads_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_tasks_user_id').on(table.userId),
  statusIdx: index('idx_tasks_status').on(table.status),
  createdAtIdx: index('idx_tasks_created_at').on(table.createdAt),
}));

export const serverLogs = pgTable('server_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  taskId: integer('task_id'),
  level: text('level').default('INFO'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  taskIdIdx: index('idx_server_logs_task_id').on(table.taskId),
  userIdIdx: index('idx_server_logs_user_id').on(table.userId),
}));

export const searches = pgTable('searches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  query: text('query').notNull(),
  taskId: integer('task_id').references(() => tasks.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_searches_user_id').on(table.userId),
  queryIdx: index('idx_searches_query').on(table.query),
}));

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  website: text('website'),
  phone: text('phone'),
  email: text('email'),
  rating: real('rating'),
  reviewsCount: integer('reviews_count'),
  category: text('category'),
  placeId: text('place_id').unique(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  directionUrl: text('direction_url'),
  mondayHours: text('monday_hours'),
  tuesdayHours: text('tuesday_hours'),
  wednesdayHours: text('wednesday_hours'),
  thursdayHours: text('thursday_hours'),
  fridayHours: text('friday_hours'),
  saturdayHours: text('saturday_hours'),
  sundayHours: text('sunday_hours'),
  facebook: text('facebook'),
  instagram: text('instagram'),
  linkedin: text('linkedin'),
  twitter: text('twitter'),
  youtube: text('youtube'),
  pinterest: text('pinterest'),
  tiktok: text('tiktok'),
  websiteEmail: text('website_email'),
  websitePhone: text('website_phone'),
  leadScore: integer('lead_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  placeIdIdx: index('idx_leads_place_id').on(table.placeId),
  cityIdx: index('idx_leads_city').on(table.city),
  categoryIdx: index('idx_leads_category').on(table.category),
  leadScoreIdx: index('idx_leads_lead_score').on(table.leadScore),
}));

export const leadSources = pgTable('lead_sources', {
  leadId: integer('lead_id').references(() => leads.id),
  searchId: integer('search_id').references(() => searches.id),
  taskId: integer('task_id').references(() => tasks.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: unique('lead_sources_lead_id_search_id_unique').on(table.leadId, table.searchId),
  leadIdIdx: index('idx_lead_sources_lead_id').on(table.leadId),
  searchIdIdx: index('idx_lead_sources_search_id').on(table.searchId),
  taskIdIdx: index('idx_lead_sources_task_id').on(table.taskId),
}));

export const cityAreas = pgTable('city_areas', {
  id: serial('id').primaryKey(),
  country: text('country').notNull(),
  state: text('state').notNull(),
  city: text('city').notNull(),
  areas: text('areas').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow(),
}, (table) => ({
  unq: unique('city_areas_country_state_city_unique').on(table.country, table.state, table.city),
}));

export const keywordHistory = pgTable('keyword_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  niche: text('niche'),
  location: text('location'),
  keywords: text('keywords').notNull(),
  totalKeywords: integer('total_keywords'),
  keywordsTruncated: boolean('keywords_truncated').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const taskLeads = pgTable('task_leads', {
  taskId: integer('task_id').references(() => tasks.id),
  leadId: integer('lead_id').references(() => leads.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: unique('task_leads_task_id_lead_id_pk').on(table.taskId, table.leadId),
  taskIdIdx: index('idx_task_leads_task_id').on(table.taskId),
  leadIdIdx: index('idx_task_leads_lead_id').on(table.leadId),
}));

export const settings = pgTable('settings', {
  userId: integer('user_id').references(() => users.id),
  key: text('key').notNull(),
  value: text('value').notNull(),
}, (table) => ({
  pk: unique('settings_user_id_key_pk').on(table.userId, table.key),
}));

export const savedLists = pgTable('saved_lists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savedListItems = pgTable('saved_list_items', {
  listId: integer('list_id').references(() => savedLists.id),
  leadId: integer('lead_id').references(() => leads.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: unique('saved_list_items_list_id_lead_id_unique').on(table.listId, table.leadId),
  listIdIdx: index('idx_saved_list_items_list_id').on(table.listId),
  leadIdIdx: index('idx_saved_list_items_lead_id').on(table.leadId),
}));

export const exportTemplates = pgTable('export_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  columns: text('columns').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const proxies = pgTable('proxies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  username: text('username'),
  password: text('password'),
  protocol: text('protocol').default('http'),
  isActive: integer('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  status: text('status'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pincodeCoords = pgTable('pincode_coords', {
  country: text('country').notNull(),
  pincode: text('pincode').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: unique('pincode_coords_country_pincode_pk').on(table.country, table.pincode),
}));

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  author: text('author').default('LeadSpotter Team'),
  category: text('category').default('General'),
  readTime: text('read_time'),
  imageUrl: text('image_url'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').default(1),
  resetAt: timestamp('reset_at').notNull(),
});

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Amount in INR (0 for free)
  period: text('period').notNull(), // 'month', 'one-time', 'free', 'custom'
  leadsCredits: integer('leads_credits').notNull(),
  features: jsonb('features').$type<string[]>(),
  unavailableFeatures: jsonb('unavailable_features').$type<string[]>(),
  whatsappUrl: text('whatsapp_url'),
  badge: text('badge'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  planId: integer('plan_id').references(() => plans.id),
  amount: text('amount').notNull(),
  status: text('status').default('pending'),
  gatewayOrderId: text('gateway_order_id'),
  utr: text('utr'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
