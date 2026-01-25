# 📦 Logistics Engine API

A high-performance backend service for shipment tracking and logistics management. Built with **NestJS**, **GraphQL**, and **Fastify**, utilizing **TiDB Cloud** for serverless scalability.

## 🛠 Tech Stack

* **Framework:** [NestJS v11](https://nestjs.com/)
* **API Layer:** [GraphQL](https://graphql.org/) (Apollo Server)
* **HTTP Server:** [Fastify](https://www.fastify.io/) (Optimized for high throughput)
* **Database & ORM:** [Prisma](https://www.prisma.io/) with [TiDB Cloud Adapter](https://pingcap.com/products/tidb-cloud/)
* **Auth:** JWT & Bcrypt
* **Validation:** Class-validator & Class-transformer

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+ recommended)
* TiDB Cloud account or a MySQL-compatible database
* npm / pnpm / yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/isteppu/api-logistics-nestjs.git
   cd logistics-engine
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment: Create a .env file in the root and add your credentials:**
   ```bash
   DATABASE_URL="sampleurl"
   SECRET="secret"
   ```
4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### 🏃 Scripts

    ```
        npm run start:dev - Start application in watch mode

        npm run build - Build the project for production

        npm run start:prod - Run the compiled production bundle

        npm run lint - Fix code style issues with ESLint

        npm run format - Format code using Prettier
    ```

### 🧪 Testing

This project uses Jest for testing.

    ```
    Unit Tests: npm run test

    Watch Mode: npm run test:watch

    E2E Tests: npm run test:e2e

    Coverage: npm run test:cov
    ```

### 📐 Project Structure

    ```
    src/ 
    ├── generated/ # Prisma generated client 
    ├── modules/ # Domain logic (Shipments, Users, etc.) 
    ├── common/ # Guards, Decorators, and Interceptors 
    ├── main.ts # Entry point (Fastify Adapter) 
    └── app.module.ts # Root module
    ```

### 🔒 License

This project is UNLICENSED and private.