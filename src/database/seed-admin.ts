/**
 * Seed script — creates a single ADMIN user.
 *
 * Usage:
 *   pnpm db:seed:admin
 *
 * Credentials can be overridden via environment variables:
 *   ADMIN_EMAIL    (default: admin@quickhire.com)
 *   ADMIN_PASSWORD (default: Admin@1234)
 *   ADMIN_NAME     (default: Admin)
 */

import * as bcrypt from 'bcryptjs';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as AuthSchema from '../models/drizzle/auth.model';
import * as EnumSchema from '../models/drizzle/enum.model';
import * as JobSchema from '../models/drizzle/job.model';
import * as RelationSchema from '../models/drizzle/relation.model';

const schema = { ...AuthSchema, ...EnumSchema, ...JobSchema, ...RelationSchema };

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@quickhire.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@1234';
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Admin';
const SALT_ROUNDS = 12;

async function seedAdmin() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle(pool, { schema });

	console.log(`\nSeeding admin user: ${ADMIN_EMAIL}`);

	// Check if an admin already exists with this email
	const existing = await db.query.users.findFirst({
		where: eq(schema.users.email, ADMIN_EMAIL),
	});

	if (existing) {
		if (existing.role === 'ADMIN') {
			console.log(`✔ Admin user "${ADMIN_EMAIL}" already exists — skipping.`);
		} else {
			// Promote existing user to ADMIN
			await db
				.update(schema.users)
				.set({ role: 'ADMIN', emailVerified: true })
				.where(eq(schema.users.email, ADMIN_EMAIL));
			console.log(`✔ Existing user "${ADMIN_EMAIL}" promoted to ADMIN.`);
		}
		await pool.end();
		process.exit(0);
	}

	const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

	await db.insert(schema.users).values({
		name: ADMIN_NAME,
		email: ADMIN_EMAIL,
		password: hashedPassword,
		emailVerified: true,
		role: 'ADMIN',
	});

	console.log(`✔ Admin user created successfully.`);
	console.log(`  Email   : ${ADMIN_EMAIL}`);
	console.log(`  Password: ${ADMIN_PASSWORD}`);
	console.log(`\n⚠  Change the default password before deploying to production!\n`);

	await pool.end();
	process.exit(0);
}

seedAdmin().catch(err => {
	console.error('Admin seeding failed:', err);
	process.exit(1);
});
