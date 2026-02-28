import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { type ApiResponse, createApiResponse } from '../../core/api-response.interceptor';
import { validateUUID } from '../../core/validators/commonRules';
import { JobSchemaType } from '../../database/types';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JOB_CATEGORIES, JOB_EMPLOYMENT_TYPES, JOB_LOCATIONS } from './job.constants';
import {
	type CreateJobDto,
	createJobSchema,
	type JobQueryDto,
	jobQuerySchema,
	type UpdateJobDto,
	updateJobSchema,
} from './job.schema';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
	constructor(private readonly jobService: JobService) {}

	@Get()
	async findAll(@Query() query: JobQueryDto): Promise<ApiResponse<JobSchemaType[]>> {
		const validate = jobQuerySchema.safeParse(query);
		if (!validate.success) {
			throw new BadRequestException(validate.error.issues.map(issue => issue.message).join(', '));
		}

		const { jobs, pagination } = await this.jobService.findAll(validate.data);

		return createApiResponse(HttpStatus.OK, 'Jobs fetched successfully', jobs, pagination);
	}

	@Get('assets')
	getAssets(): ApiResponse<{
		locations: typeof JOB_LOCATIONS;
		employmentTypes: typeof JOB_EMPLOYMENT_TYPES;
		categories: typeof JOB_CATEGORIES;
	}> {
		return createApiResponse(HttpStatus.OK, 'Job filters fetched successfully', {
			locations: JOB_LOCATIONS,
			employmentTypes: JOB_EMPLOYMENT_TYPES,
			categories: JOB_CATEGORIES,
		});
	}

	@Get(':id')
	async findById(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<JobSchemaType>> {
		const validate = validateUUID('Job ID').safeParse(id);
		if (!validate.success) {
			throw new BadRequestException(validate.error.issues.map(issue => issue.message).join(', '));
		}

		const job = await this.jobService.findById(validate.data);

		return createApiResponse(HttpStatus.OK, 'Job fetched successfully', job);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@Post()
	async createJob(@Body() body: CreateJobDto): Promise<ApiResponse<JobSchemaType>> {
		const validate = createJobSchema.safeParse(body);
		if (!validate.success) {
			throw new BadRequestException(validate.error.issues.map(issue => issue.message).join(', '));
		}

		const job = await this.jobService.createJob(validate.data);

		return createApiResponse(HttpStatus.CREATED, 'Job created successfully', job);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@Patch(':id')
	async updateJob(
		@Param('id') id: string,
		@Body() body: UpdateJobDto,
	): Promise<ApiResponse<JobSchemaType>> {
		const idValidate = validateUUID('Job ID').safeParse(id);
		if (!idValidate.success) {
			throw new BadRequestException(idValidate.error.issues.map(issue => issue.message).join(', '));
		}

		const bodyValidate = updateJobSchema.safeParse(body);
		if (!bodyValidate.success) {
			throw new BadRequestException(
				bodyValidate.error.issues.map(issue => issue.message).join(', '),
			);
		}

		const job = await this.jobService.updateJob(idValidate.data, bodyValidate.data);

		return createApiResponse(HttpStatus.OK, 'Job updated successfully', job);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@Delete(':id')
	async deleteJob(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<null>> {
		const validate = validateUUID('Job ID').safeParse(id);
		if (!validate.success) {
			throw new BadRequestException(validate.error.issues.map(issue => issue.message).join(', '));
		}

		await this.jobService.deleteJob(validate.data);

		return createApiResponse(HttpStatus.OK, 'Job deleted successfully', null);
	}
}
