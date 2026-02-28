import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { JOB_CATEGORIES, JOB_LOCATIONS } from '../app/job/job.constants';
import { jobs } from '../models/drizzle/job.model';

interface SeedJob {
	id: string;
	title: string;
	company: string;
	companyLogoUrl: string | null;
	location: string;
	category: string;
	employmentType: string;
	tags: string[];
	description: string;
	isFeatured: boolean;
	createdAt: string;
	updatedAt: string;
	// fields not in DB schema (intentionally ignored):
	// salary, requirements, benefits
}

const validLocations = new Set<string>(JOB_LOCATIONS);
const validCategories = new Set<string>(JOB_CATEGORIES);

const seedData = JSON.parse(readFileSync(join(process.cwd(), 'seed.json'), 'utf-8')) as {
	jobs: SeedJob[];
};

async function seed() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle(pool);

	console.log('Seeding jobs...');

	const valid: SeedJob[] = [];
	const skipped: { title: string; reason: string }[] = [];

	for (const job of seedData.jobs) {
		const issues: string[] = [];
		if (!validLocations.has(job.location)) issues.push(`invalid location "${job.location}"`);
		if (!validCategories.has(job.category)) issues.push(`invalid category "${job.category}"`);

		if (issues.length > 0) {
			skipped.push({ title: job.title, reason: issues.join(', ') });
		} else {
			valid.push(job);
		}
	}

	if (skipped.length > 0) {
		console.warn(`\nSkipped ${skipped.length} job(s) due to constant mismatches:`);
		skipped.forEach(s => console.warn(`  - "${s.title}": ${s.reason}`));
		console.warn('');
	}

	const rows = valid.map(job => ({
		title: job.title,
		company: job.company,
		companyLogoUrl: job.companyLogoUrl ?? null,
		location: job.location,
		category: job.category,
		employmentType: job.employmentType,
		tags: job.tags,
		description: job.description,
		isFeatured: job.isFeatured,
		createdAt: new Date(job.createdAt),
		updatedAt: new Date(job.updatedAt),
	}));

	await db
		.insert(jobs)
		.values(rows)
		.onConflictDoUpdate({
			target: jobs.id,
			set: {
				title: sql`excluded.title`,
				company: sql`excluded.company`,
				companyLogoUrl: sql`excluded.company_logo_url`,
				location: sql`excluded.location`,
				category: sql`excluded.category`,
				employmentType: sql`excluded.employment_type`,
				tags: sql`excluded.tags`,
				description: sql`excluded.description`,
				isFeatured: sql`excluded.is_featured`,
				updatedAt: sql`excluded.updated_at`,
			},
		});

	console.log(`Seeded ${rows.length} job(s) successfully.`);
	await pool.end();
	process.exit(0);
}

seed().catch(err => {
	console.error('Seeding failed:', err);
	process.exit(1);
});
