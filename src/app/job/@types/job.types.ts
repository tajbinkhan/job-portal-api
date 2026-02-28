import { ApplicationSchemaType, JobSchemaType } from '../../../database/types';

export type { ApplicationSchemaType, JobSchemaType };

export type CreateJob = Omit<JobSchemaType, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateApplication = Omit<ApplicationSchemaType, 'id' | 'createdAt' | 'updatedAt'>;
