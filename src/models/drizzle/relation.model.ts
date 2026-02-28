import { relations } from 'drizzle-orm';
import { applications, jobs } from './job.model';

// In your schema file
export const jobsRelations = relations(jobs, ({ many }) => ({
	applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
	job: one(jobs, {
		fields: [applications.jobId],
		references: [jobs.id],
	}),
}));
