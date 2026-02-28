import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, eq, ilike, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pagination } from '../../core/api-response.interceptor';
import PaginationManager from '../../core/pagination';
import { DATABASE_CONNECTION } from '../../database/connection';
import { orderByColumn } from '../../database/helpers';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import { JobSchemaType } from '../../database/types';
import { CreateJobDto, JobQueryDto, UpdateJobDto } from './job.schema';

@Injectable()
export class JobService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	async findAll(query: JobQueryDto): Promise<{ jobs: JobSchemaType[]; pagination: Pagination }> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;

		const conditions: SQL[] = [];

		if (query.search) {
			conditions.push(ilike(schema.jobs.title, `%${query.search}%`));
		}
		if (query.category) {
			conditions.push(eq(schema.jobs.category, query.category));
		}
		if (query.location) {
			conditions.push(eq(schema.jobs.location, query.location));
		}
		if (query.employmentType) {
			conditions.push(eq(schema.jobs.employmentType, query.employmentType));
		}
		if (query.isFeatured !== undefined) {
			conditions.push(eq(schema.jobs.isFeatured, query.isFeatured));
		}

		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [{ total }] = await this.getDb()
			.select({ total: count() })
			.from(schema.jobs)
			.where(where);

		const paginationManager = new PaginationManager(page, limit, total);
		const { pagination, offset } = paginationManager.createPagination();

		const orderBy = orderByColumn(schema.jobs, query.sortBy, query.sortOrder ?? 'desc');

		const jobs = await this.getDb()
			.select()
			.from(schema.jobs)
			.where(where)
			.orderBy(...(orderBy ? [orderBy] : []))
			.limit(limit)
			.offset(offset);

		return { jobs, pagination };
	}

	async findById(id: string): Promise<JobSchemaType> {
		const job = await this.getDb().query.jobs.findFirst({
			where: eq(schema.jobs.id, id),
		});

		if (!job) throw new NotFoundException('Job not found');

		return job;
	}

	async createJob(data: CreateJobDto): Promise<JobSchemaType> {
		const job = await this.getDb()
			.insert(schema.jobs)
			.values({
				title: data.title,
				company: data.company,
				companyLogoUrl: data.companyLogoUrl ?? null,
				location: data.location,
				category: data.category,
				employmentType: data.employmentType ?? 'Full-Time',
				tags: data.tags ?? [],
				description: data.description,
				isFeatured: data.isFeatured ?? false,
			})
			.returning()
			.then(rows => rows[0]);

		return job;
	}

	async updateJob(id: string, data: UpdateJobDto): Promise<JobSchemaType> {
		const existing = await this.getDb().query.jobs.findFirst({
			where: eq(schema.jobs.id, id),
		});

		if (!existing) throw new NotFoundException('Job not found');

		const updated = await this.getDb()
			.update(schema.jobs)
			.set(data)
			.where(eq(schema.jobs.id, id))
			.returning()
			.then(rows => rows[0]);

		return updated;
	}

	async deleteJob(id: string): Promise<void> {
		const existing = await this.getDb().query.jobs.findFirst({
			where: eq(schema.jobs.id, id),
		});

		if (!existing) throw new NotFoundException('Job not found');

		await this.getDb().delete(schema.jobs).where(eq(schema.jobs.id, id));
	}
}
