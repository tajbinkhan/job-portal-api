import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
	providers: [JobService, ApplicationService],
	controllers: [JobController, ApplicationController],
})
export class JobModule {}
