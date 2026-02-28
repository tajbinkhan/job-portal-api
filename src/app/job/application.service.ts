import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import { ApplicationSchemaType } from '../../database/types';
import { CreateApplicationDto } from './job.schema';

@Injectable()
export class ApplicationService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	async submitApplication(data: CreateApplicationDto): Promise<ApplicationSchemaType> {
		const job = await this.getDb().query.jobs.findFirst({
			where: eq(schema.jobs.id, data.jobId),
		});

		if (!job) throw new NotFoundException('Job not found');

		const application = await this.getDb()
			.insert(schema.applications)
			.values({
				jobId: data.jobId,
				name: data.name,
				email: data.email,
				resumeLink: data.resumeLink,
				coverNote: data.coverNote,
			})
			.returning()
			.then(rows => rows[0]);

		return application;
	}
}
