# Multi-Tenant Inventory & Order Management System

A backend application for managing inventory and orders across multiple companies using a shared application infrastructure with tenant-level data isolation.

## Tech Stack

- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA / Hibernate
- MariaDB
- Maven
- REST APIs

## Implemented Features

- Company registration and tenant creation
- JWT-based authentication
- BCrypt password hashing
- Role-based authorization (Admin, Manager, Staff)
- Multi-tenant data isolation
- Product CRUD operations
- Tenant-specific SKU uniqueness
- Protected REST endpoints

## Architecture

Controller → Service → Repository → Database

## Database

MariaDB

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register company |
| POST | `/api/auth/login` | User login |
| GET | `/api/health` | Health check |
| POST | `/api/products` | Create product |
| GET | `/api/products` | Get tenant products |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

## Local Setup

1. Clone this repository.
2. Create a MariaDB database named `inventory_management`.
3. Configure the required environment variables:
    - `DB_PASSWORD`
    - `JWT_SECRET`
4. Run the application using Maven:

```bash
./mvnw spring-boot:run
```

Application runs at `http://localhost:8080`.

## Project Status

Backend development in progress.

Planned features include inventory movements, purchase orders, sales orders, Redis caching, Kafka integration, automated testing, and a React frontend.

## Author

Samadhan Patil