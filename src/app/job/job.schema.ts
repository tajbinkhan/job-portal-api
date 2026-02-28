import z from 'zod';
import { baseQuerySchema } from '../../core/validators/baseQuery.schema';
import {
	validateArray,
	validateBoolean,
	validateEmail,
	validateString,
	validateUrl,
	validateUUID,
} from '../../core/validators/commonRules';

/* =========================
   CREATE JOB SCHEMA
========================= */

export const createJobSchema = z.object({
	title: validateString('Title', { min: 1, max: 180 }),
	company: validateString('Company', { min: 1, max: 180 }),
	companyLogoUrl: validateUrl('Company Logo URL').optional().nullable(),
	location: validateString('Location', { min: 1, max: 120 }),
	category: validateString('Category', { min: 1, max: 80 }),
	employmentType: validateString('Employment Type', { min: 1, max: 30 }).optional(),
	tags: validateArray('Tags', validateString('Tag')).optional(),
	description: validateString('Description', { min: 1 }),
	isFeatured: validateBoolean('Is Featured').optional(),
});

/* =========================
   JOB LIST QUERY SCHEMA
========================= */

const jobSortableFields = [
	{ name: 'title', queryName: 'title' },
	{ name: 'createdAt', queryName: 'createdAt' },
] as const;

export const jobQuerySchema = baseQuerySchema(jobSortableFields).extend({
	category: validateString('Category').optional(),
	location: validateString('Location').optional(),
	employmentType: validateString('Employment Type').optional(),
	isFeatured: z.coerce.boolean().optional(),
});

/* =========================
   UPDATE JOB SCHEMA
========================= */

export const updateJobSchema = createJobSchema.partial();

/* =========================
   CREATE APPLICATION SCHEMA
========================= */

export const createApplicationSchema = z.object({
	jobId: validateUUID('Job ID'),
	name: validateString('Name', { min: 1, max: 120 }),
	email: validateEmail,
	resumeLink: validateUrl('Resume Link'),
	coverNote: validateString('Cover Note', { min: 1 }),
});

/* =========================
   INFERRED TYPES
========================= */

export type CreateJobDto = z.infer<typeof createJobSchema>;
export type UpdateJobDto = z.infer<typeof updateJobSchema>;
export type JobQueryDto = z.infer<typeof jobQuerySchema>;
export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;
