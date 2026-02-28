# Jobs & Applications API

Base URL: `http://localhost:{PORT}` (no global prefix)

All responses follow the unified envelope:

```ts
interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
	timestamp: string; // ISO 8601
	path: string;
	pagination?: Pagination; // only on list endpoints
}

interface Pagination {
	totalItems: number;
	limit: number;
	offset: number;
	currentPage: number;
	totalPages: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	prevPage: number | null;
	nextPage: number | null;
}
```

Error responses from the global exception filter:

```ts
interface ErrorResponse {
	statusCode: number;
	message: string;
	timestamp: string;
	path: string;
}
```

---

## Jobs

### `GET /jobs` — List all jobs

Public. No authentication required.

#### Query Parameters

| Parameter        | Type      | Required | Default | Description                                          |
| ---------------- | --------- | -------- | ------- | ---------------------------------------------------- |
| `page`           | `number`  | No       | `1`     | Page number (positive integer)                       |
| `limit`          | `number`  | No       | `10`    | Items per page (max `500`)                           |
| `sortBy`         | `string`  | No       | —       | `title` or `createdAt`                               |
| `sortOrder`      | `string`  | No       | `desc`  | `asc` or `desc`                                      |
| `search`         | `string`  | No       | —       | Case-insensitive search on job `title`               |
| `category`       | `string`  | No       | —       | Exact match on `category`                            |
| `location`       | `string`  | No       | —       | Exact match on `location`                            |
| `employmentType` | `string`  | No       | —       | Exact match on `employmentType`                      |
| `isFeatured`     | `boolean` | No       | —       | `true` / `false` — coerced from string automatically |

#### Success Response `200`

```json
{
	"statusCode": 200,
	"message": "Jobs fetched successfully",
	"data": [
		{
			"id": "b3d2f1a0-...",
			"title": "Frontend Developer",
			"company": "Acme Corp",
			"companyLogoUrl": "https://...",
			"location": "Remote",
			"category": "Engineering",
			"employmentType": "Full-Time",
			"tags": ["React", "TypeScript"],
			"description": "We are looking for...",
			"isFeatured": false,
			"createdAt": "2026-02-28T10:00:00.000Z",
			"updatedAt": "2026-02-28T10:00:00.000Z"
		}
	],
	"timestamp": "2026-02-28T10:00:00.000Z",
	"path": "/jobs",
	"pagination": {
		"totalItems": 42,
		"limit": 10,
		"offset": 0,
		"currentPage": 1,
		"totalPages": 5,
		"hasPrevPage": false,
		"hasNextPage": true,
		"prevPage": null,
		"nextPage": 2
	}
}
```

#### Next.js Example

```ts
// lib/api/jobs.ts

export interface Job {
	id: string;
	title: string;
	company: string;
	companyLogoUrl: string | null;
	location: string;
	category: string;
	employmentType: string;
	tags: string[];
	description: string;
	isFeatured: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface JobsQuery {
	page?: number;
	limit?: number;
	sortBy?: 'title' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
	search?: string;
	category?: string;
	location?: string;
	employmentType?: string;
	isFeatured?: boolean;
}

export async function getJobs(query: JobsQuery = {}) {
	const params = new URLSearchParams();
	Object.entries(query).forEach(([key, value]) => {
		if (value !== undefined && value !== '') {
			params.set(key, String(value));
		}
	});

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?${params}`, {
		cache: 'no-store', // or 'force-cache' / revalidate for SSG
	});

	if (!res.ok) throw new Error('Failed to fetch jobs');
	return res.json() as Promise<ApiResponse<Job[]>>;
}
```

---

### `GET /jobs/:id` — Get single job

Public. No authentication required.

#### Path Parameters

| Parameter | Type     | Required | Description   |
| --------- | -------- | -------- | ------------- |
| `id`      | `string` | Yes      | Job UUID (v4) |

#### Success Response `200`

```json
{
	"statusCode": 200,
	"message": "Job fetched successfully",
	"data": {
		"id": "b3d2f1a0-...",
		"title": "Frontend Developer",
		"company": "Acme Corp",
		"companyLogoUrl": null,
		"location": "Remote",
		"category": "Engineering",
		"employmentType": "Full-Time",
		"tags": ["React"],
		"description": "...",
		"isFeatured": true,
		"createdAt": "2026-02-28T10:00:00.000Z",
		"updatedAt": "2026-02-28T10:00:00.000Z"
	},
	"timestamp": "2026-02-28T10:00:00.000Z",
	"path": "/jobs/b3d2f1a0-..."
}
```

#### Error Responses

| Status | Condition                |
| ------ | ------------------------ |
| `400`  | `id` is not a valid UUID |
| `404`  | Job not found            |

#### Next.js Example

```ts
export async function getJob(id: string) {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
		cache: 'no-store',
	});

	if (res.status === 404) return null;
	if (!res.ok) throw new Error('Failed to fetch job');
	return res.json() as Promise<ApiResponse<Job>>;
}
```

---

### `POST /jobs` — Create a job _(Admin only)_

Requires authentication. The authenticated user must have role `ADMIN`.

**Authentication:** Cookie-based JWT. The `access-token` cookie must be present (set after login).

**CSRF:** This is a mutating request. Send the CSRF token in the `x-csrf-token` header. Obtain it
first via `GET /csrf`.

#### Request Body

```json
{
	"title": "Frontend Developer",
	"company": "Acme Corp",
	"companyLogoUrl": "https://acme.com/logo.png",
	"location": "Remote",
	"category": "Engineering",
	"employmentType": "Full-Time",
	"tags": ["React", "TypeScript"],
	"description": "We are looking for a skilled frontend developer...",
	"isFeatured": false
}
```

#### Request Body Schema

| Field            | Type       | Required | Constraints                       |
| ---------------- | ---------- | -------- | --------------------------------- |
| `title`          | `string`   | Yes      | max 180 chars                     |
| `company`        | `string`   | Yes      | max 180 chars                     |
| `companyLogoUrl` | `string`   | No       | valid URL, max 2048 chars         |
| `location`       | `string`   | Yes      | max 120 chars                     |
| `category`       | `string`   | Yes      | max 80 chars                      |
| `employmentType` | `string`   | No       | max 30 chars, default `Full-Time` |
| `tags`           | `string[]` | No       | array of strings, default `[]`    |
| `description`    | `string`   | Yes      | min 1 char                        |
| `isFeatured`     | `boolean`  | No       | default `false`                   |

#### Success Response `201`

```json
{
	"statusCode": 201,
	"message": "Job created successfully",
	"data": {
		/* full Job object */
	},
	"timestamp": "...",
	"path": "/jobs"
}
```

#### Error Responses

| Status | Condition                                    |
| ------ | -------------------------------------------- |
| `400`  | Validation failed (message lists all issues) |
| `401`  | Not authenticated                            |
| `403`  | Authenticated but not ADMIN / CSRF invalid   |

#### Next.js Example

```ts
export async function createJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
	// 1. Get CSRF token
	const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf`, {
		credentials: 'include',
	});
	const {
		data: { csrfToken },
	} = await csrfRes.json();

	// 2. Create job
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
		method: 'POST',
		credentials: 'include', // sends access-token cookie
		headers: {
			'Content-Type': 'application/json',
			'x-csrf-token': csrfToken,
		},
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message);
	}
	return res.json() as Promise<ApiResponse<Job>>;
}
```

---

### `DELETE /jobs/:id` — Delete a job _(Admin only)_

Requires authentication. The authenticated user must have role `ADMIN`.

**Authentication:** Cookie-based JWT (`access-token` cookie). **CSRF:** Required — send
`x-csrf-token` header.

#### Path Parameters

| Parameter | Type     | Required | Description   |
| --------- | -------- | -------- | ------------- |
| `id`      | `string` | Yes      | Job UUID (v4) |

#### Success Response `200`

```json
{
	"statusCode": 200,
	"message": "Job deleted successfully",
	"data": null,
	"timestamp": "...",
	"path": "/jobs/b3d2f1a0-..."
}
```

#### Error Responses

| Status | Condition                                  |
| ------ | ------------------------------------------ |
| `400`  | `id` is not a valid UUID                   |
| `401`  | Not authenticated                          |
| `403`  | Authenticated but not ADMIN / CSRF invalid |
| `404`  | Job not found                              |

#### Next.js Example

```ts
export async function deleteJob(id: string) {
	const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf`, {
		credentials: 'include',
	});
	const {
		data: { csrfToken },
	} = await csrfRes.json();

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
		method: 'DELETE',
		credentials: 'include',
		headers: { 'x-csrf-token': csrfToken },
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message);
	}
	return res.json() as Promise<ApiResponse<null>>;
}
```

---

## Applications

### `POST /applications` — Submit a job application

Public. No authentication required.

**CSRF:** Required — send `x-csrf-token` header (obtain via `GET /csrf`).

#### Request Body

```json
{
	"jobId": "b3d2f1a0-...",
	"name": "Jane Doe",
	"email": "jane@example.com",
	"resumeLink": "https://drive.google.com/file/...",
	"coverNote": "I am excited to apply for this position because..."
}
```

#### Request Body Schema

| Field        | Type     | Required | Constraints                |
| ------------ | -------- | -------- | -------------------------- |
| `jobId`      | `string` | Yes      | UUID v4 of an existing job |
| `name`       | `string` | Yes      | max 120 chars              |
| `email`      | `string` | Yes      | valid email, max 255 chars |
| `resumeLink` | `string` | Yes      | valid URL, max 2048 chars  |
| `coverNote`  | `string` | Yes      | min 1 char                 |

#### Success Response `201`

```json
{
	"statusCode": 201,
	"message": "Application submitted successfully",
	"data": {
		"id": "a1b2c3d4-...",
		"jobId": "b3d2f1a0-...",
		"name": "Jane Doe",
		"email": "jane@example.com",
		"resumeLink": "https://...",
		"coverNote": "...",
		"createdAt": "2026-02-28T10:00:00.000Z",
		"updatedAt": "2026-02-28T10:00:00.000Z"
	},
	"timestamp": "...",
	"path": "/applications"
}
```

#### Error Responses

| Status | Condition                      |
| ------ | ------------------------------ |
| `400`  | Validation failed              |
| `403`  | CSRF token missing or invalid  |
| `404`  | `jobId` does not match any job |

#### Next.js Example

```ts
export interface ApplicationPayload {
	jobId: string;
	name: string;
	email: string;
	resumeLink: string;
	coverNote: string;
}

export interface Application {
	id: string;
	jobId: string;
	name: string;
	email: string;
	resumeLink: string;
	coverNote: string;
	createdAt: string;
	updatedAt: string;
}

export async function submitApplication(payload: ApplicationPayload) {
	const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf`, {
		credentials: 'include',
	});
	const {
		data: { csrfToken },
	} = await csrfRes.json();

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'x-csrf-token': csrfToken,
		},
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message);
	}
	return res.json() as Promise<ApiResponse<Application>>;
}
```

---

## TypeScript Types (copy-paste ready)

```ts
// types/api.ts

export interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
	timestamp: string;
	path: string;
	pagination?: Pagination;
}

export interface Pagination {
	totalItems: number;
	limit: number;
	offset: number;
	currentPage: number;
	totalPages: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	prevPage: number | null;
	nextPage: number | null;
}

export interface Job {
	id: string;
	title: string;
	company: string;
	companyLogoUrl: string | null;
	location: string;
	category: string;
	employmentType: string;
	tags: string[];
	description: string;
	isFeatured: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Application {
	id: string;
	jobId: string;
	name: string;
	email: string;
	resumeLink: string;
	coverNote: string;
	createdAt: string;
	updatedAt: string;
}
```

---

## CSRF Flow

All mutating requests (`POST`, `DELETE`) require a valid CSRF token.

```ts
// lib/csrf.ts
export async function getCsrfToken(): Promise<string> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf`, {
		credentials: 'include',
	});
	const json = await res.json();
	return json.data.csrfToken;
}
```

You can cache this token in memory per session and only re-fetch on a `403` response.

---

## Environment Variables (Next.js)

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```
