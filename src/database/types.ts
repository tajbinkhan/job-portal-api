import type { InferSelectModel } from 'drizzle-orm';
import { accounts, sessions, users } from '../models/drizzle/auth.model';
import { roleEnum } from '../models/drizzle/enum.model';
import { applications, jobs } from '../models/drizzle/job.model';

export type UserSchemaType = InferSelectModel<typeof users>;
export type SessionSchemaType = InferSelectModel<typeof sessions>;
export type AccountSchemaType = InferSelectModel<typeof accounts>;
export type JobSchemaType = InferSelectModel<typeof jobs>;
export type ApplicationSchemaType = InferSelectModel<typeof applications>;

/**
 * Enum Schema Types
 */
export type RoleEnumType = (typeof roleEnum.enumValues)[number];
