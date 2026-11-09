# Multi-Tenant Inventory & Order Management System

A full-stack ERP-style inventory and order management application built with Java, Spring Boot, React, and MariaDB. The system allows multiple companies to manage their products, inventory, suppliers, customers, purchase orders, and sales orders through a shared application with tenant-level data isolation.

## Features

### Authentication & Authorization
- Company registration and tenant creation
- JWT-based authentication
- BCrypt password hashing
- Role-based access control (ADMIN, MANAGER, STAFF)
- Protected REST APIs
- Tenant-level data isolation

### Product & Category Management
- Create, view, update, and delete products
- Tenant-specific SKU uniqueness
- Product-to-category association
- Category filtering and management
- Optional product categories
- Prevent deletion of categories assigned to products
- Stock quantity managed separately from product details

### Supplier & Customer Management
- Supplier CRUD operations
- Customer CRUD operations
- Tenant-scoped records
- Duplicate email validation

### Inventory Management
- Stock In and Stock Out operations
- Product-wise stock movement history
- Recent stock movement tracking
- Low-stock and out-of-stock identification
- Stock validation to prevent negative inventory

### Purchase Order Management
- Create purchase orders with multiple products
- Confirm purchase orders
- Receive purchase orders
- Automatically increase product stock upon receiving
- Generate STOCK_IN movements
- Cancel eligible purchase orders
- Prevent duplicate receiving

### Sales Order Management
- Create sales orders with multiple products
- Confirm sales orders
- Dispatch sales orders
- Automatically deduct stock upon dispatch
- Generate STOCK_OUT movements
- Cancel eligible sales orders
- Prevent duplicate dispatch

### Dashboard & Analytics
- Total products, customers, and suppliers
- Inventory valuation
- Low-stock and out-of-stock product counts
- Sales and purchase order statistics
- Completed sales and purchase amounts
- Recent stock movements

### Frontend
- React-based ERP dashboard
- Responsive application layout
- Product, category, supplier, and customer management
- Purchase and sales order workflows
- Inventory management interface
- Search, filtering, and pagination
- Role-aware UI actions
- Form validation and error handling

## Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA / Hibernate
- JWT Authentication (JJWT)
- BCrypt
- MariaDB
- Maven
- REST APIs
- JUnit 5 and Mockito

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Recharts

## Architecture

The application currently follows a **Modular Monolith Architecture**.

```text
                 React Frontend
                 (Vite + Tailwind)
                        |
                        | REST API
                        |
                 Spring Boot Backend
                        |
          +-------------+-------------+
          |             |             |
      Controller     Service      Security
          |             |
          +-------------+
                        |
                   Repository
                        |
                     JPA
                        |
                    MariaDB
```

### Multi-Tenant Strategy

The application uses a shared database and shared application infrastructure.

- Each company is represented by a Tenant.
- Tenant-owned records are associated with a tenant ID.
- Repository queries are tenant-scoped.
- The authenticated user's tenant ID determines data access.
- Client-provided tenant IDs are not trusted for tenant isolation.

### User Roles

| Role | Permissions |
|---|---|
| ADMIN | Full access, including deletion and management |
| MANAGER | Manage products, categories, suppliers, customers, orders, and stock |
| STAFF | View permitted business and inventory information |

## Project Structure

```text
inventory-management/
|
+-- src/
|   +-- main/
|   |   +-- java/com/samadhan/inventory/
|   |   |   +-- config/
|   |   |   +-- controller/
|   |   |   +-- dto/
|   |   |   +-- entity/
|   |   |   +-- exception/
|   |   |   +-- repository/
|   |   |   +-- security/
|   |   |   +-- service/
|   |   |
|   |   +-- resources/
|   |       +-- application.properties
|   |
|   +-- test/
|
+-- frontend/
|   +-- src/
|       +-- components/
|       +-- context/
|       +-- layouts/
|       +-- pages/
|       +-- services/
|
+-- pom.xml
+-- README.md
```

## API Endpoints

Base URL: `http://localhost:8080/api`

All endpoints except authentication and health checks require a valid JWT unless otherwise configured.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register company and admin |
| POST | `/auth/login` | Authenticate user |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Retrieve dashboard analytics |

### Products

| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create product |
| GET | `/products` | Get tenant products |
| GET | `/products/{id}` | Get product details |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| POST | `/categories` | Create category |
| GET | `/categories` | Get categories |
| PUT | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete category |

### Suppliers

| Method | Endpoint | Description |
|---|---|---|
| POST | `/suppliers` | Create supplier |
| GET | `/suppliers` | Get suppliers |
| PUT | `/suppliers/{id}` | Update supplier |
| DELETE | `/suppliers/{id}` | Delete supplier |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers` | Create customer |
| GET | `/customers` | Get customers |
| PUT | `/customers/{id}` | Update customer |
| DELETE | `/customers/{id}` | Delete customer |

### Inventory & Stock Movements

| Method | Endpoint | Description |
|---|---|---|
| POST | `/products/{productId}/stock-movements` | Record stock movement |
| GET | `/stock-movements` | Get tenant stock movements |
| GET | `/products/{productId}/stock-movements` | Get product movement history |

### Purchase Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/purchase-orders` | Create purchase order |
| GET | `/purchase-orders` | Get purchase orders |
| GET | `/purchase-orders/{id}` | Get purchase order details |
| PATCH | `/purchase-orders/{id}/confirm` | Confirm purchase order |
| PATCH | `/purchase-orders/{id}/receive` | Receive purchase order |
| PATCH | `/purchase-orders/{id}/cancel` | Cancel purchase order |

### Sales Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/sales-orders` | Create sales order |
| GET | `/sales-orders` | Get sales orders |
| GET | `/sales-orders/{id}` | Get sales order details |
| PATCH | `/sales-orders/{id}/confirm` | Confirm sales order |
| PATCH | `/sales-orders/{id}/dispatch` | Dispatch sales order |
| PATCH | `/sales-orders/{id}/cancel` | Cancel sales order |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Application health check |

## Business Workflows

### Purchase Order Workflow

```text
DRAFT
  |
  v
CONFIRMED
  |
  v
RECEIVED
```

- Stock increases only when a purchase order is received.
- Receiving creates STOCK_IN movement records.
- Eligible orders can be cancelled before receiving.

### Sales Order Workflow

```text
DRAFT
  |
  v
CONFIRMED
  |
  v
DISPATCHED
```

- Stock is deducted only when a sales order is dispatched.
- Dispatch creates STOCK_OUT movement records.
- Eligible orders can be cancelled before dispatch.

## Local Setup

### Prerequisites

- Java 21
- Maven
- Node.js and npm
- MariaDB

### 1. Clone the Repository

```bash
git clone https://github.com/samadhan-stack/multi-tenant-inventory-management.git

cd multi-tenant-inventory-management
```

### 2. Create the Database

Create a MariaDB database:

```sql
CREATE DATABASE inventory_management;
```

Configure a database user with appropriate privileges.

### 3. Configure Environment Variables

The backend uses the following environment variables:

| Variable | Description |
|---|---|
| `DB_URL` | MariaDB JDBC URL (optional; has a default) |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key used for JWT signing |

Example for Linux:

```bash
export DB_URL="jdbc:mariadb://localhost:3306/inventory_management"
export DB_USERNAME="inventory_user"
export DB_PASSWORD="your_database_password"
export JWT_SECRET="your_secure_jwt_secret"
```

Keep your actual credentials private. Never commit secrets to GitHub.

### 4. Run the Backend

From the project root:

```bash
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### 5. Run the Frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Vite will display the local development URL, usually:

```text
http://localhost:5173
```

The frontend API service uses `http://localhost:8080/api` by default. You can override it using `VITE_API_BASE_URL`.

## Running Tests

Run backend tests from the project root:

```bash
mvn clean test
```

The backend includes JUnit 5 and Mockito-based service tests.

## Production Frontend Build

From the frontend directory:

```bash
npm run build
```

The production build is generated in:

```text
frontend/dist/
```

## Current Project Status

**Core backend and frontend modules implemented.**

The application currently supports tenant-aware authentication, product and category management, supplier and customer management, purchase and sales order workflows, inventory operations, and dashboard analytics.

### Planned Improvements

- Docker and Docker Compose
- CI/CD using GitHub Actions
- Database schema versioning with Flyway
- Integration testing with Testcontainers
- Frontend code splitting and performance optimization
- Audit logging
- Redis caching
- Kafka-based event processing
- Cloud deployment

## Author

**Samadhan Patil**

GitHub: [@samadhan-stack](https://github.com/samadhan-stack)

---

Built as a practical full-stack project to explore enterprise application development, multi-tenancy, inventory workflows, and scalable backend architecture.