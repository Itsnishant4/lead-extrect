CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`status` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_user_id` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_user_created` ON `audit_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`author` text DEFAULT 'LeadSpotter Team',
	`category` text DEFAULT 'General',
	`read_time` text,
	`image_url` text,
	`meta_title` text,
	`meta_description` text,
	`is_published` integer DEFAULT false,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `city_areas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`country` text NOT NULL,
	`state` text NOT NULL,
	`city` text NOT NULL,
	`areas` text NOT NULL,
	`last_updated` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `city_areas_country_state_city_unique` ON `city_areas` (`country`,`state`,`city`);--> statement-breakpoint
CREATE TABLE `export_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`columns` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `integration_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`integration_id` integer NOT NULL,
	`task_id` integer,
	`action` text NOT NULL,
	`status` text NOT NULL,
	`leads_count` integer DEFAULT 0,
	`error_message` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_integration_logs_user_id` ON `integration_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_integration_logs_integration_id` ON `integration_logs` (`integration_id`);--> statement-breakpoint
CREATE INDEX `idx_integration_logs_created_at` ON `integration_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`feature_flag` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`icon_url` text,
	`is_active` integer DEFAULT true,
	`oauth_provider` text,
	`config_schema` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `integrations_slug_unique` ON `integrations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_integrations_slug` ON `integrations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_integrations_category` ON `integrations` (`category`);--> statement-breakpoint
CREATE TABLE `keyword_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`niche` text,
	`location` text,
	`keywords` text NOT NULL,
	`total_keywords` integer,
	`keywords_truncated` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_keyword_history_user_id` ON `keyword_history` (`user_id`);--> statement-breakpoint
CREATE TABLE `lead_sources` (
	`lead_id` integer,
	`search_id` integer,
	`task_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`search_id`) REFERENCES `searches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_lead_sources_lead_id` ON `lead_sources` (`lead_id`);--> statement-breakpoint
CREATE INDEX `idx_lead_sources_search_id` ON `lead_sources` (`search_id`);--> statement-breakpoint
CREATE INDEX `idx_lead_sources_task_id` ON `lead_sources` (`task_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `lead_sources_lead_id_search_id_unique` ON `lead_sources` (`lead_id`,`search_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`city` text,
	`website` text,
	`phone` text,
	`email` text,
	`rating` real,
	`reviews_count` integer,
	`category` text,
	`place_id` text,
	`latitude` real,
	`longitude` real,
	`direction_url` text,
	`monday_hours` text,
	`tuesday_hours` text,
	`wednesday_hours` text,
	`thursday_hours` text,
	`friday_hours` text,
	`saturday_hours` text,
	`sunday_hours` text,
	`facebook` text,
	`instagram` text,
	`linkedin` text,
	`twitter` text,
	`youtube` text,
	`pinterest` text,
	`tiktok` text,
	`website_email` text,
	`website_phone` text,
	`lead_score` integer DEFAULT 0,
	`email_verified` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_place_id_unique` ON `leads` (`place_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_place_id` ON `leads` (`place_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_city` ON `leads` (`city`);--> statement-breakpoint
CREATE INDEX `idx_leads_category` ON `leads` (`category`);--> statement-breakpoint
CREATE INDEX `idx_leads_lead_score` ON `leads` (`lead_score`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_id` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_notifications_is_read` ON `notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE TABLE `pincode_coords` (
	`country` text NOT NULL,
	`pincode` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pincode_coords_country_pincode_pk` ON `pincode_coords` (`country`,`pincode`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` integer NOT NULL,
	`discount` integer DEFAULT 0,
	`period` text NOT NULL,
	`leads_credits` integer NOT NULL,
	`max_concurrent_tasks` integer DEFAULT 1,
	`features` text,
	`unavailable_features` text,
	`whatsapp_url` text,
	`badge` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `proxies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`host` text NOT NULL,
	`port` integer NOT NULL,
	`username` text,
	`password` text,
	`protocol` text DEFAULT 'http',
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_push_subscriptions_user_id` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved_list_items` (
	`list_id` integer,
	`lead_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`list_id`) REFERENCES `saved_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_saved_list_items_list_id` ON `saved_list_items` (`list_id`);--> statement-breakpoint
CREATE INDEX `idx_saved_list_items_lead_id` ON `saved_list_items` (`lead_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `saved_list_items_list_id_lead_id_unique` ON `saved_list_items` (`list_id`,`lead_id`);--> statement-breakpoint
CREATE TABLE `saved_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `searches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`query` text NOT NULL,
	`task_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_searches_user_id` ON `searches` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_searches_query` ON `searches` (`query`);--> statement-breakpoint
CREATE INDEX `idx_searches_user_created` ON `searches` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `seo_hub_registry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`niche` text NOT NULL,
	`city` text NOT NULL,
	`total_leads` integer DEFAULT 0,
	`with_email` integer DEFAULT 0,
	`with_phone` integer DEFAULT 0,
	`with_website` integer DEFAULT 0,
	`avg_rating` real DEFAULT 0,
	`last_updated` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unq_seo_niche_city` ON `seo_hub_registry` (`niche`,`city`);--> statement-breakpoint
CREATE TABLE `server_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`task_id` integer,
	`level` text DEFAULT 'INFO',
	`message` text,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `idx_server_logs_task_id` ON `server_logs` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_server_logs_user_id` ON `server_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`user_id` integer,
	`key` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_user_id_key_pk` ON `settings` (`user_id`,`key`);--> statement-breakpoint
CREATE TABLE `site_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `task_leads` (
	`task_id` integer,
	`lead_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_task_leads_task_id` ON `task_leads` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_task_leads_lead_id` ON `task_leads` (`lead_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_leads_task_id_lead_id_pk` ON `task_leads` (`task_id`,`lead_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`status` text DEFAULT 'pending',
	`status_reason` text,
	`total_keywords` integer DEFAULT 0,
	`current_keyword_index` integer DEFAULT 0,
	`total_leads` integer DEFAULT 0,
	`keywords` text,
	`user_agent` text,
	`accept_language` text,
	`last_logs_sent_at` integer DEFAULT (unixepoch()),
	`last_heartbeat` integer DEFAULT (unixepoch()),
	`export_file_ids` text,
	`export_status` text,
	`export_created_at` integer,
	`exported_leads_count` integer DEFAULT 0,
	`retry_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_user_id` ON `tasks` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_status` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_created_at` ON `tasks` (`created_at`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`plan_id` integer,
	`amount` text NOT NULL,
	`status` text DEFAULT 'pending',
	`gateway_order_id` text,
	`utr` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_user_id` ON `transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_transactions_status` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_transactions_gateway_order_id` ON `transactions` (`gateway_order_id`);--> statement-breakpoint
CREATE TABLE `user_api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`key_prefix` text NOT NULL,
	`permissions` text,
	`last_used_at` integer,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_api_keys_user_id` ON `user_api_keys` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_api_keys_key_hash_unique` ON `user_api_keys` (`key_hash`);--> statement-breakpoint
CREATE TABLE `user_integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`integration_id` integer NOT NULL,
	`is_enabled` integer DEFAULT true,
	`access_token` text,
	`refresh_token` text,
	`token_expiry` integer,
	`api_key` text,
	`config` text,
	`last_synced_at` integer,
	`total_synced` integer DEFAULT 0,
	`last_error` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_integrations_user_id` ON `user_integrations` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_integrations_integration_id` ON `user_integrations` (`integration_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_integrations_user_integration_unique` ON `user_integrations` (`user_id`,`integration_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`is_admin` integer DEFAULT false,
	`is_suspended` integer DEFAULT false,
	`plan_type` text DEFAULT 'free',
	`leads_extracted` integer DEFAULT 0,
	`bonus_credits` integer DEFAULT 0,
	`subscription_expiry` integer,
	`otp_code` text,
	`otp_expiry` integer,
	`otp_attempts` integer DEFAULT 0,
	`country` text,
	`city` text,
	`latitude` real,
	`longitude` real,
	`last_active` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_last_active` ON `users` (`last_active`);