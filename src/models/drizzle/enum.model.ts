import { pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['ADMIN', 'SUBSCRIBER']);
