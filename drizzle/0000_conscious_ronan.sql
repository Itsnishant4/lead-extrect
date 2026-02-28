CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"status" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"author" text DEFAULT 'LeadSpotter Team',
	"category" text DEFAULT 'General',
	"read_time" text,
	"image_url" text,
	"meta_title" text,
	"meta_description" text,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "city_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" text NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"areas" text NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "city_areas_country_state_city_unique" UNIQUE("country","state","city")
);
--> statement-breakpoint
CREATE TABLE "export_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"columns" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "keyword_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"niche" text,
	"location" text,
	"keywords" text NOT NULL,
	"total_keywords" integer,
	"keywords_truncated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_sources" (
	"lead_id" integer,
	"search_id" integer,
	"task_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "lead_sources_lead_id_search_id_unique" UNIQUE("lead_id","search_id")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"website" text,
	"phone" text,
	"email" text,
	"rating" real,
	"reviews_count" integer,
	"category" text,
	"place_id" text,
	"latitude" real,
	"longitude" real,
	"direction_url" text,
	"monday_hours" text,
	"tuesday_hours" text,
	"wednesday_hours" text,
	"thursday_hours" text,
	"friday_hours" text,
	"saturday_hours" text,
	"sunday_hours" text,
	"facebook" text,
	"instagram" text,
	"linkedin" text,
	"twitter" text,
	"youtube" text,
	"pinterest" text,
	"tiktok" text,
	"website_email" text,
	"website_phone" text,
	"lead_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "leads_place_id_unique" UNIQUE("place_id")
);
--> statement-breakpoint
CREATE TABLE "pincode_coords" (
	"country" text NOT NULL,
	"pincode" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "pincode_coords_country_pincode_pk" UNIQUE("country","pincode")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"discount" integer DEFAULT 0,
	"period" text NOT NULL,
	"leads_credits" integer NOT NULL,
	"features" jsonb,
	"unavailable_features" jsonb,
	"whatsapp_url" text,
	"badge" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proxies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"host" text NOT NULL,
	"port" integer NOT NULL,
	"username" text,
	"password" text,
	"protocol" text DEFAULT 'http',
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1,
	"reset_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_list_items" (
	"list_id" integer,
	"lead_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "saved_list_items_list_id_lead_id_unique" UNIQUE("list_id","lead_id")
);
--> statement-breakpoint
CREATE TABLE "saved_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"query" text NOT NULL,
	"task_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seo_hub_registry" (
	"id" serial PRIMARY KEY NOT NULL,
	"niche" text NOT NULL,
	"city" text NOT NULL,
	"total_leads" integer DEFAULT 0,
	"with_email" integer DEFAULT 0,
	"with_phone" integer DEFAULT 0,
	"with_website" integer DEFAULT 0,
	"avg_rating" real DEFAULT 0,
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "unq_seo_niche_city" UNIQUE("niche","city")
);
--> statement-breakpoint
CREATE TABLE "server_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"task_id" integer,
	"level" text DEFAULT 'INFO',
	"message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"user_id" integer,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "settings_user_id_key_pk" UNIQUE("user_id","key")
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_leads" (
	"task_id" integer,
	"lead_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "task_leads_task_id_lead_id_pk" UNIQUE("task_id","lead_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"status" text DEFAULT 'pending',
	"status_reason" text,
	"total_keywords" integer DEFAULT 0,
	"current_keyword_index" integer DEFAULT 0,
	"total_leads" integer DEFAULT 0,
	"keywords" jsonb,
	"user_agent" text,
	"accept_language" text,
	"last_logs_sent_at" timestamp DEFAULT now(),
	"last_heartbeat" timestamp DEFAULT now(),
	"export_file_ids" text,
	"export_status" text,
	"export_created_at" timestamp,
	"exported_leads_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"plan_id" integer,
	"amount" text NOT NULL,
	"status" text DEFAULT 'pending',
	"gateway_order_id" text,
	"utr" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"is_suspended" boolean DEFAULT false,
	"plan_type" text DEFAULT 'free',
	"leads_extracted" integer DEFAULT 0,
	"bonus_credits" integer DEFAULT 0,
	"subscription_expiry" timestamp,
	"otp_code" text,
	"otp_expiry" timestamp with time zone,
	"otp_attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_templates" ADD CONSTRAINT "export_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_history" ADD CONSTRAINT "keyword_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_sources" ADD CONSTRAINT "lead_sources_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_sources" ADD CONSTRAINT "lead_sources_search_id_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."searches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_sources" ADD CONSTRAINT "lead_sources_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proxies" ADD CONSTRAINT "proxies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_list_items" ADD CONSTRAINT "saved_list_items_list_id_saved_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."saved_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_list_items" ADD CONSTRAINT "saved_list_items_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_lists" ADD CONSTRAINT "saved_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searches" ADD CONSTRAINT "searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searches" ADD CONSTRAINT "searches_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_leads" ADD CONSTRAINT "task_leads_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_leads" ADD CONSTRAINT "task_leads_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lead_sources_lead_id" ON "lead_sources" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_lead_sources_search_id" ON "lead_sources" USING btree ("search_id");--> statement-breakpoint
CREATE INDEX "idx_lead_sources_task_id" ON "lead_sources" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_leads_place_id" ON "leads" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "idx_leads_city" ON "leads" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_leads_category" ON "leads" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_leads_lead_score" ON "leads" USING btree ("lead_score");--> statement-breakpoint
CREATE INDEX "idx_saved_list_items_list_id" ON "saved_list_items" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "idx_saved_list_items_lead_id" ON "saved_list_items" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_searches_user_id" ON "searches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_searches_query" ON "searches" USING btree ("query");--> statement-breakpoint
CREATE INDEX "idx_server_logs_task_id" ON "server_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_server_logs_user_id" ON "server_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_task_leads_task_id" ON "task_leads" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_task_leads_lead_id" ON "task_leads" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_id" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_created_at" ON "tasks" USING btree ("created_at");