import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { timestamps } from '../../database/helpers';

/* =========================
   JOBS TABLE
========================= */

export const jobs = pgTable(
	'jobs',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		// Core Info
		title: varchar('title', { length: 180 }).notNull(),
		company: varchar('company', { length: 180 }).notNull(),
		companyLogoUrl: varchar('company_logo_url', { length: 2048 }),

		location: varchar('location', { length: 120 }).notNull(),

		// For dropdown filtering
		category: varchar('category', { length: 80 }).notNull(),

		// Full-Time / Part-Time / Contract etc.
		employmentType: varchar('employment_type', { length: 30 }).notNull().default('Full-Time'),

		// Pills like: ["Marketing", "Design"]
		tags: text('tags')
			.array()
			.notNull()
			.default(sql`'{}'::text[]`),

		description: text('description').notNull(),

		isFeatured: boolean('is_featured').notNull().default(false),
		...timestamps,
	},
	table => ({
		titleIdx: index('jobs_title_idx').on(table.title),
		categoryIdx: index('jobs_category_idx').on(table.category),
		locationIdx: index('jobs_location_idx').on(table.location),
		featuredIdx: index('jobs_featured_idx').on(table.isFeatured),
	}),
);

/* =========================
   APPLICATIONS TABLE
========================= */

export const applications = pgTable(
	'applications',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		jobId: uuid('job_id')
			.notNull()
			.references(() => jobs.id, { onDelete: 'cascade' }),

		name: varchar('name', { length: 120 }).notNull(),
		email: varchar('email', { length: 254 }).notNull(),
		resumeLink: varchar('resume_link', { length: 2048 }).notNull(),
		coverNote: text('cover_note').notNull(),

		...timestamps,
	},
	table => ({
		jobIdx: index('applications_job_idx').on(table.jobId),
	}),
);
