import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { type ApiResponse, createApiResponse } from '../../core/api-response.interceptor';
import { ApplicationSchemaType } from '../../database/types';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApplicationService } from './application.service';
import {
	type ApplicationQueryDto,
	applicationQuerySchema,
	type CreateApplicationDto,
	createApplicationSchema,
} from './job.schema';

@Controller('applications')
export class ApplicationController {
	constructor(private readonly applicationService: ApplicationService) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@Get()
	async findAll(
		@Query() query: ApplicationQueryDto,
	): Promise<ApiResponse<ApplicationSchemaType[]>> {
		const validate = applicationQuerySchema.safeParse(query);
		if (!validate.success) {
			throw new BadRequestException(validate.error.issues.map(issue => issue.message).join(', '));
		}

		const { applications, pagination } = await this.applicationService.findAll(validate.data);

		return createApiResponse(
			HttpStatus.OK,
			'Applications fetched successfully',
			applications,
			pagination,
		);
	}

	@Post()
	async submitApplication(
		@Body() body: CreateApplicationDto,
	): Promise<ApiResponse<ApplicationSchemaType>> {
		const validate = createApplicationSchema.safeParse(body);
		if (!validate.success) {
			throw new BadRequestException(validate.error.issues.map(issue => issue.message).join(', '));
		}

		const application = await this.applicationService.submitApplication(validate.data);

		return createApiResponse(HttpStatus.CREATED, 'Application submitted successfully', application);
	}
}
