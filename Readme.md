# HotelStay Backend

Minimal, pragmatic README for the HotelStay backend service.

## Table of Contents
- [Project](#project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
    - [Environment](#environment)
    - [Install](#install)
    - [Run (development)](#run-development)
    - [Run (production)](#run-production)
- [Database](#database)
- [Testing](#testing)
- [Linting & Formatting](#linting--formatting)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project
HotelStay Backend — RESTful API and business logic for the HotelStay application (bookings, users, payments, listings). This repository contains the server-side implementation and configuration.

## Features
- User authentication and authorization
- Listings and booking management
- Payment integration hooks
- Admin endpoints and reporting
- Validation, logging and error handling

## Tech Stack
- Node.js (LTS)
- Express (or Fastify — adjust as appropriate)
- TypeScript or JavaScript
- PostgreSQL (or MongoDB — adjust as appropriate)
- TypeORM / Prisma / Sequelize (DB ORM — adjust)
- Jest / Vitest (testing)
- Docker for containerization

## Prerequisites
- Node.js >= 16
- npm >= 8 or Yarn
- Docker & docker-compose (optional for local DB)
- PostgreSQL (or configured DB)

## Getting Started

### Environment
Create a `.env` from the example:
```
cp .env.example .env
```
Common variables:
```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgres://user:pass@localhost:5432/HotelStay
JWT_SECRET=replace_with_secure_secret
LOG_LEVEL=info
STRIPE_SECRET_KEY=sk_test_...
```

### Install
Using npm:
```
npm install
```
Or Yarn:
```
yarn
```

### Run (development)
With hot reload (e.g., nodemon / ts-node-dev):
```
npm run dev
```

### Run (production)
Build and start:
```
npm run build
npm start
```

Or using Docker:
```
docker build -t HotelStay-backend .
docker run --env-file .env -p 4000:4000 HotelStay-backend
```

## Database
- Run migrations (example with a generic CLI):
```
npm run migration:run
```
- Seed sample data:
```
npm run seed
```
If using Docker Compose, start DB:
```
docker-compose up -d
```

## Testing
Run tests:
```
npm test
```
Run tests with coverage:
```
npm run test:coverage
```

## Linting & Formatting
- Lint:
```
npm run lint
```
- Format:
```
npm run format
```

## API Documentation
- Swagger / OpenAPI available at `/api/docs` when running in dev (if implemented).
- Keep API contracts in `openapi.yaml` or `docs/`.

## Deployment
- Use environment variables for secrets.
- Recommended: containerize and deploy to your cloud provider (AWS, Azure, GCP, DigitalOcean).
- Use CI pipeline to run tests, lint, build and publish artifacts.

## Project Structure (suggested)
```
/src
    /controllers
    /routes
    /services
    /models
    /repositories
    /middlewares
    /utils
    index.ts
/tests
/migrations
/docs
.env.example
package.json
tsconfig.json
```

## Contributing
- Open issues for bugs or feature requests.
- Follow coding standards and write tests for new code.
- Create pull requests against `develop` (or the agreed branch) and reference related issue.

## License
Specify license in LICENSE file (e.g., MIT).

## Contact
For questions or support, open an issue in this repository.
