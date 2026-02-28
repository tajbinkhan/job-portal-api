import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
	@Get()
	getRoot(@Res() res: Response) {
		const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Board API - Server Running</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            max-width: 860px;
            width: 100%;
            overflow: hidden;
            animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.15);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-top: 10px;
        }

        .status-dot {
            width: 10px;
            height: 10px;
            background: #4ade80;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .content {
            padding: 40px 30px;
        }

        .info-section {
            margin-bottom: 30px;
        }

        .info-section h2 {
            color: #1e3a5f;
            font-size: 1.4rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }

        .api-routes {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-top: 15px;
        }

        .route-item {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            margin-bottom: 8px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #1e3a5f;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .route-item:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(30, 58, 95, 0.15);
        }

        .route-item:last-child {
            margin-bottom: 0;
        }

        .method {
            background: #1e3a5f;
            color: white;
            padding: 3px 10px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.78rem;
            min-width: 62px;
            text-align: center;
            margin-right: 14px;
            letter-spacing: 0.05em;
        }

        .method.post { background: #16a34a; }
        .method.put  { background: #d97706; }
        .method.patch { background: #ca8a04; }
        .method.delete { background: #dc2626; }

        .route-path {
            font-family: 'Courier New', monospace;
            color: #1f2937;
            font-weight: 500;
            font-size: 0.92rem;
        }

        .route-desc {
            margin-left: auto;
            font-size: 0.8rem;
            color: #6b7280;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 18px;
            margin-top: 15px;
        }

        .feature-card {
            background: linear-gradient(135deg, #0f172a08 0%, #1e3a5f10 100%);
            padding: 18px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            transition: transform 0.2s;
        }

        .feature-card:hover {
            transform: translateY(-4px);
        }

        .feature-card h3 {
            color: #1e3a5f;
            margin-bottom: 8px;
            font-size: 1rem;
        }

        .feature-card p {
            color: #6b7280;
            font-size: 0.875rem;
            line-height: 1.5;
        }

        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .footer a {
            color: #1e3a5f;
            text-decoration: none;
            font-weight: 600;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .content { padding: 30px 20px; }
            .features { grid-template-columns: 1fr; }
            .route-desc { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💼 Job Board API</h1>
            <p style="margin-top: 10px; opacity: 0.85;">RESTful API Service</p>
            <div class="status">
                <span class="status-dot"></span>
                <span>Server Running</span>
            </div>
        </div>

        <div class="content">
            <div class="info-section">
                <h2>✨ Features</h2>
                <div class="features">
                    <div class="feature-card">
                        <h3>🔐 Authentication</h3>
                        <p>JWT-based auth with session management and Google OAuth 2.0 support</p>
                    </div>
                    <div class="feature-card">
                        <h3>💼 Jobs</h3>
                        <p>Full CRUD for job listings with filtering, pagination, and category management</p>
                    </div>
                    <div class="feature-card">
                        <h3>📋 Applications</h3>
                        <p>Job application submission with validation and tracking</p>
                    </div>
                    <div class="feature-card">
                        <h3>🛡️ Security</h3>
                        <p>CSRF protection, encryption, role-based access control, and secure cookies</p>
                    </div>
                    <div class="feature-card">
                        <h3>🗄️ Database</h3>
                        <p>PostgreSQL with Drizzle ORM for type-safe, performant database operations</p>
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h2>🗺️ API Routes</h2>
                <div class="api-routes">
                    <div class="route-item">
                        <span class="method">GET</span>
                        <span class="route-path">/jobs</span>
                        <span class="route-desc">List all jobs</span>
                    </div>
                    <div class="route-item">
                        <span class="method">GET</span>
                        <span class="route-path">/jobs/:id</span>
                        <span class="route-desc">Get job by ID</span>
                    </div>
                    <div class="route-item">
                        <span class="method post">POST</span>
                        <span class="route-path">/jobs</span>
                        <span class="route-desc">Create a job</span>
                    </div>
                    <div class="route-item">
                        <span class="method patch">PATCH</span>
                        <span class="route-path">/jobs/:id</span>
                        <span class="route-desc">Update a job</span>
                    </div>
                    <div class="route-item">
                        <span class="method delete">DELETE</span>
                        <span class="route-path">/jobs/:id</span>
                        <span class="route-desc">Delete a job</span>
                    </div>
                    <div class="route-item">
                        <span class="method">GET</span>
                        <span class="route-path">/jobs/assets</span>
                        <span class="route-desc">Get job filter assets</span>
                    </div>
                    <div class="route-item">
                        <span class="method post">POST</span>
                        <span class="route-path">/applications</span>
                        <span class="route-desc">Submit a job application</span>
                    </div>
                    <div class="route-item">
                        <span class="method post">POST</span>
                        <span class="route-path">/auth/register</span>
                        <span class="route-desc">Register a new account</span>
                    </div>
                    <div class="route-item">
                        <span class="method post">POST</span>
                        <span class="route-path">/auth/login</span>
                        <span class="route-desc">Login with credentials</span>
                    </div>
                    <div class="route-item">
                        <span class="method post">POST</span>
                        <span class="route-path">/auth/logout</span>
                        <span class="route-desc">Logout current session</span>
                    </div>
                    <div class="route-item">
                        <span class="method">GET</span>
                        <span class="route-path">/auth/me</span>
                        <span class="route-desc">Get current user profile</span>
                    </div>
                    <div class="route-item">
                        <span class="method put">PUT</span>
                        <span class="route-path">/auth/profile</span>
                        <span class="route-desc">Update user profile</span>
                    </div>
                    <div class="route-item">
                        <span class="method">GET</span>
                        <span class="route-path">/auth/google</span>
                        <span class="route-desc">Google OAuth login</span>
                    </div>
                    <div class="route-item">
                        <span class="method">GET</span>
                        <span class="route-path">/csrf</span>
                        <span class="route-desc">Get CSRF token</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Built with <a href="https://nestjs.com" target="_blank">NestJS</a> • Version 0.0.1</p>
            <p style="margin-top: 5px;">API is ready to accept requests</p>
        </div>
    </div>
</body>
</html>
		`;

		res.setHeader('Content-Type', 'text/html');
		res.send(html);
	}
}
