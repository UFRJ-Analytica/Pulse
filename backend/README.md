# Analytica Pulse API

NestJS + TypeScript API. Page URLs and page rendering stay in the React frontend; this service exposes `/api/v1/*` endpoints.

## Run locally

```bash
npm install
cp .env.example .env
npm run start:dev
```

The initial endpoint is `GET http://localhost:3000/api/v1/health`. The API currently returns service health only; dashboard and indicator endpoints will be added when their response contracts and data sources are ready.

`dotenv` loads `backend/.env` at startup. `CORS_ORIGINS` accepts a comma-separated list of exact frontend origins and defaults to the local Vite origins shown in `.env.example`. `ValidationPipe` uses `class-validator` and `class-transformer` for DTO validation. Never put provider API keys in the frontend or commit `.env`.
