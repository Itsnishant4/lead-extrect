import { sqliteTable, integer, text, real, unique, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  isSuspended: integer('is_suspended', { mode: 'boolean' }).default(false),
  planType: text('plan_type').default('free'),
  leadsExtracted: integer('leads_extracted').default(0),
  bonusCredits: integer('bonus_credits').default(0),
  subscriptionExpiry: integer('subscription_expiry', { mode: 'timestamp' }),
  otpCode: text('otp_code'),
  otpExpiry: integer('otp_expiry', { mode: 'timestamp' }),
  otpAttempts: integer('otp_attempts').default(0),
  leadQualityThreshold: integer('lead_quality_threshold').default(20),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  status: text('status').default('pending'),
  statusReason: text('status_reason'),
  totalKeywords: integer('total_keywords').default(0),
  currentKeywordIndex: integer('current_keyword_index').default(0),
  totalLeads: integer('total_leads').default(0),
  keywords: text('keywords', { mode: 'json' }),
  userAgent: text('user_agent'),
  acceptLanguage: text('accept_language'),
  lastLogsSentAt: integer('last_logs_sent_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  lastHeartbeat: integer('last_heartbeat', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  exportFileIds: text('export_file_ids'),
  exportStatus: text('export_status'),
  exportCreatedAt: integer('export_created_at', { mode: 'timestamp' }),
  exportedLeadsCount: integer('exported_leads_count').default(0),
  retryCount: integer('retry_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('idx_tasks_user_id').on(table.userId),
  statusIdx: index('idx_tasks_status').on(table.status),
  createdAtIdx: index('idx_tasks_created_at').on(table.createdAt),
}));

export const serverLogs = sqliteTable('server_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  taskId: integer('task_id'),
  level: text('level').default('INFO'),
  message: text('message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  taskIdIdx: index('idx_server_logs_task_id').on(table.taskId),
  userIdIdx: index('idx_server_logs_user_id').on(table.userId),
}));

export const searches = sqliteTable('searches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  query: text('query').notNull(),
  taskId: integer('task_id').references(() => tasks.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('idx_searches_user_id').on(table.userId),
  queryIdx: index('idx_searches_query').on(table.query),
}));

export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  placeIdIdx: index('idx_leads_place_id').on(table.placeId),
  cityIdx: index('idx_leads_city').on(table.city),
  categoryIdx: index('idx_leads_category').on(table.category),
  leadScoreIdx: index('idx_leads_lead_score').on(table.leadScore),
}));

export const leadSources = sqliteTable('lead_sources', {
  leadId: integer('lead_id').references(() => leads.id),
  searchId: integer('search_id').references(() => searches.id),
  taskId: integer('task_id').references(() => tasks.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: unique('lead_sources_lead_id_search_id_unique').on(table.leadId, table.searchId),
  leadIdIdx: index('idx_lead_sources_lead_id').on(table.leadId),
  searchIdIdx: index('idx_lead_sources_search_id').on(table.searchId),
  taskIdIdx: index('idx_lead_sources_task_id').on(table.taskId),
}));

export const cityAreas = sqliteTable('city_areas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  country: text('country').notNull(),
  state: text('state').notNull(),
  city: text('city').notNull(),
  areas: text('areas').notNull(),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  unq: unique('city_areas_country_state_city_unique').on(table.country, table.state, table.city),
}));

export const keywordHistory = sqliteTable('keyword_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  niche: text('niche'),
  location: text('location'),
  keywords: text('keywords').notNull(),
  totalKeywords: integer('total_keywords'),
  keywordsTruncated: integer('keywords_truncated', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const taskLeads = sqliteTable('task_leads', {
  taskId: integer('task_id').references(() => tasks.id),
  leadId: integer('lead_id').references(() => leads.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: unique('task_leads_task_id_lead_id_pk').on(table.taskId, table.leadId),
  taskIdIdx: index('idx_task_leads_task_id').on(table.taskId),
  leadIdIdx: index('idx_task_leads_lead_id').on(table.leadId),
}));

export const settings = sqliteTable('settings', {
  userId: integer('user_id').references(() => users.id),
  key: text('key').notNull(),
  value: text('value').notNull(),
}, (table) => ({
  pk: unique('settings_user_id_key_pk').on(table.userId, table.key),
}));

export const savedLists = sqliteTable('saved_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const savedListItems = sqliteTable('saved_list_items', {
  listId: integer('list_id').references(() => savedLists.id),
  leadId: integer('lead_id').references(() => leads.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: unique('saved_list_items_list_id_lead_id_unique').on(table.listId, table.leadId),
  listIdIdx: index('idx_saved_list_items_list_id').on(table.listId),
  leadIdIdx: index('idx_saved_list_items_lead_id').on(table.leadId),
}));

export const exportTemplates = sqliteTable('export_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  columns: text('columns').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const proxies = sqliteTable('proxies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  username: text('username'),
  password: text('password'),
  protocol: text('protocol').default('http'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  status: text('status'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const pincodeCoords = sqliteTable('pincode_coords', {
  country: text('country').notNull(),
  pincode: text('pincode').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: unique('pincode_coords_country_pincode_pk').on(table.country, table.pincode),
}));

export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').default(1),
  resetAt: integer('reset_at', { mode: 'timestamp' }).notNull(),
});

export const plans = sqliteTable('plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Amount in INR (0 for free)
  discount: integer('discount').default(0), // Original price before discount (0 = no discount)
  period: text('period').notNull(), // 'month', 'one-time', 'free', 'custom'
  leadsCredits: integer('leads_credits').notNull(),
  maxConcurrentTasks: integer('max_concurrent_tasks').default(1),
  features: text('features', { mode: 'json' }),
  unavailableFeatures: text('unavailable_features', { mode: 'json' }),
  whatsappUrl: text('whatsapp_url'),
  badge: text('badge'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  planId: integer('plan_id').references(() => plans.id),
  amount: text('amount').notNull(),
  status: text('status').default('pending'),
  gatewayOrderId: text('gateway_order_id'),
  utr: text('utr'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const siteConfig = sqliteTable('site_config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const seoHubRegistry = sqliteTable('seo_hub_registry', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  niche: text('niche').notNull(),
  city: text('city').notNull(),
  totalLeads: integer('total_leads').default(0),
  withEmail: integer('with_email').default(0),
  withPhone: integer('with_phone').default(0),
  withWebsite: integer('with_website').default(0),
  avgRating: real('avg_rating').default(0),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  unqNicheCity: unique('unq_seo_niche_city').on(t.niche, t.city)
}));

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'task_completed' | 'task_failed' | 'credits_low' | 'payment_success' | 'subscription_expiring' | 'general'
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  metadata: text('metadata', { mode: 'json' }), // optional JSON for links, task IDs, etc.
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('idx_notifications_user_id').on(table.userId),
  isReadIdx: index('idx_notifications_is_read').on(table.userId, table.isRead),
}));

export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('idx_push_subscriptions_user_id').on(table.userId),
  endpointIdx: unique('push_subscriptions_endpoint_unique').on(table.endpoint),
}));
