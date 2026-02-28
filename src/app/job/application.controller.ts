import { BadRequestException, Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { type ApiResponse, createApiResponse } from '../../core/api-response.interceptor';
import { ApplicationSchemaType } from '../../database/types';
import { ApplicationService } from './application.service';
import { type CreateApplicationDto, createApplicationSchema } from './job.schema';

@Controller('applications')
export class ApplicationController {
	constructor(private readonly applicationService: ApplicationService) {}

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
