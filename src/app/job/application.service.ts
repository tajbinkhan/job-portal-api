import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, eq, ilike, or, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pagination } from '../../core/api-response.interceptor';
import PaginationManager from '../../core/pagination';
import { DATABASE_CONNECTION } from '../../database/connection';
import { orderByColumn } from '../../database/helpers';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import { ApplicationSchemaType } from '../../database/types';
import { ApplicationQueryDto, CreateApplicationDto } from './job.schema';

@Injectable()
export class ApplicationService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	async findAll(
		query: ApplicationQueryDto,
	): Promise<{ applications: ApplicationSchemaType[]; pagination: Pagination }> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;

		const conditions: SQL[] = [];

		if (query.jobId) {
			conditions.push(eq(schema.applications.jobId, query.jobId));
		}
		if (query.search) {
			conditions.push(
				or(
					ilike(schema.applications.name, `%${query.search}%`),
					ilike(schema.applications.email, `%${query.search}%`),
				)!,
			);
		}

		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [{ total }] = await this.getDb()
			.select({ total: count() })
			.from(schema.applications)
			.where(where);

		const paginationManager = new PaginationManager(page, limit, total);
		const { pagination, offset } = paginationManager.createPagination();

		const orderBy = orderByColumn(schema.applications, query.sortBy, query.sortOrder ?? 'desc');

		const applications = await this.getDb()
			.select()
			.from(schema.applications)
			.where(where)
			.orderBy(...(orderBy ? [orderBy] : []))
			.limit(limit)
			.offset(offset);

		return { applications, pagination };
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
