# Multi-Tenant Inventory & Order Management System

A full-stack inventory and order management application built with **Java, Spring Boot, React, and MariaDB**. The system allows multiple companies to manage their products, inventory, suppliers, customers, purchase orders, and sales orders through a shared application with tenant-level data isolation.

## Features

### Authentication & User Management
- Company registration and automatic tenant creation.
- JWT-based authentication.
- Secure password hashing using BCrypt.
- Role-based access control (ADMIN, MANAGER, STAFF).
- Admin-managed employee accounts.
- Employee role management and account activation/deactivation.
- Disabled users cannot authenticate using existing JWT tokens.

### Multi-Tenant Architecture
- Multiple companies supported within a shared application.
- Tenant-specific data isolation.
- Tenant ownership enforced through authenticated user context.
- Tenant-scoped database queries.
- Unique product SKUs within each tenant.

### Product & Master Data Management
- Product CRUD operations.
- Category management.
- Product-category association.
- Supplier management.
- Customer management.
- Search, filtering, and pagination in the frontend.

### Inventory Management
- Manual stock-in and stock-out operations.
- Stock movement history.
- Stock movement reasons and timestamps.
- Insufficient stock validation.
- Optimistic locking for concurrent inventory updates.

### Purchase Order Management
- Create and manage purchase orders.
- Purchase order lifecycle:
    - DRAFT
    - CONFIRMED
    - RECEIVED
    - CANCELLED
- Automatic inventory increase when a purchase order is received.
- Automatic stock movement history generation.
- Prevention of duplicate order receiving.

### Sales Order Management
- Create and manage sales orders.
- Sales order lifecycle:
    - DRAFT
    - CONFIRMED
    - DISPATCHED
    - CANCELLED
- Inventory deduction during dispatch.
- Automatic stock-out movement generation.
- Stock availability validation.
- Prevention of duplicate order dispatch.

### Dashboard
- Total products, customers, and suppliers.
- Total inventory valuation.
- Low-stock and out-of-stock indicators.
- Purchase and sales order statistics.
- Recent stock movement activity.

### Frontend
- React-based responsive ERP interface.
- Role-aware navigation and actions.
- Protected routes.
- Dashboard and data management pages.
- Forms, tables, search, and status indicators.

## Technology Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT (JJWT)
- Maven
- Bean Validation
- JUnit 5
- Mockito

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Recharts

### Database
- MariaDB

### Development Tools
- IntelliJ IDEA
- Visual Studio Code
- Postman
- Git & GitHub
- XAMPP / MariaDB

## Architecture

The application follows a modular monolithic architecture with a layered backend structure.

```text
                    React Frontend
                          |
                       Axios
                          |
                    REST API Layer
                          |
                 Spring Security + JWT
                          |
                    Controllers
                          |
                      Services
                          |
                    Repositories
                          |
                    Spring Data JPA
                          |
                       MariaDB
```

### Multi-Tenant Data Isolation

The application uses a shared database approach.

Each company is represented by a tenant, and tenant-owned records are associated with a tenant ID.

The authenticated user's tenant context determines which records can be accessed. Tenant IDs are not trusted from client requests for data ownership.

## Project Structure

```text
inventory-management/
│
├── src/
│   ├── main/
│   │   ├── java/com/samadhan/inventory/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── pom.xml
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Java 21 or later
- Maven (or use the included Maven Wrapper)
- Node.js and npm
- MariaDB

### 1. Clone the Repository

```bash
git clone https://github.com/samadhan-stack/multi-tenant-inventory-management.git

cd multi-tenant-inventory-management
```

### 2. Configure MariaDB

Create the database:

```sql
CREATE DATABASE inventory_management;
```

Create a database user and grant access:

```sql
CREATE USER 'inventory_user'@'localhost'
IDENTIFIED BY 'your_database_password';

GRANT ALL PRIVILEGES ON inventory_management.*
TO 'inventory_user'@'localhost';

FLUSH PRIVILEGES;
```

### 3. Configure Environment Variables

Configure the following environment variables before starting the backend:

```bash
export DB_URL="jdbc:mariadb://localhost:3306/inventory_management"
export DB_USERNAME="inventory_user"
export DB_PASSWORD="your_database_password"
export JWT_SECRET="your_generated_jwt_secret"
```

Generate a JWT secret using:

```bash
openssl rand -base64 32
```

Keep database credentials and JWT secrets private. Never commit them to GitHub.

### 4. Run the Backend

From the project root:

```bash
./mvnw spring-boot:run
```

The backend will start at:

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

The frontend will be available at:

```text
http://localhost:5173
```

If required, configure the frontend API base URL in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## API Endpoints

All protected endpoints require a valid JWT Bearer token.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a company |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/health` | Health check |

### User Management (ADMIN)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Create employee |
| GET | `/api/users` | List tenant employees |
| PATCH | `/api/users/{id}/role` | Update employee role |
| PATCH | `/api/users/{id}/status` | Activate/deactivate employee |

### Core Resources

| Resource | Endpoint |
|---|---|
| Products | `/api/products` |
| Categories | `/api/categories` |
| Suppliers | `/api/suppliers` |
| Customers | `/api/customers` |
| Inventory | `/api/stock-movements` |
| Dashboard | `/api/dashboard` |
| Purchase Orders | `/api/purchase-orders` |
| Sales Orders | `/api/sales-orders` |

### Stock Movements

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products/{id}/stock-movements` | Record stock movement |
| GET | `/api/products/{id}/stock-movements` | Product movement history |
| GET | `/api/stock-movements` | Tenant movement history |

Purchase and sales order lifecycle actions are exposed through their respective order-specific endpoints.

## Role-Based Access Control

| Feature | ADMIN | MANAGER | STAFF |
|---|:---:|:---:|:---:|
| View dashboard | ✓ | ✓ | ✓ |
| View products | ✓ | ✓ | ✓ |
| Create/update products | ✓ | ✓ | ✗ |
| Delete products | ✓ | ✗ | ✗ |
| Manage categories | ✓ | ✓ | ✗ |
| Manage suppliers/customers | ✓ | ✓ | ✗ |
| Manage inventory | ✓ | ✓ | View |
| Manage purchase/sales orders | ✓ | ✓ | View |
| Manage employees | ✓ | ✗ | ✗ |

## Testing

The project includes backend unit tests using JUnit 5 and Mockito.

The implemented workflows have also been tested using Postman, including:

- Authentication and authorization.
- Tenant data isolation.
- Product and master data operations.
- Stock movements and insufficient stock validation.
- Purchase and sales order workflows.
- Employee creation and role management.
- Employee activation and deactivation.
- Rejection of disabled users' existing JWT tokens.

Frontend production build verification:

```bash
cd frontend
npm run build
```

## Future Enhancements

- Docker and Docker Compose.
- Redis caching.
- Kafka-based event processing.
- Flyway database migrations.
- Automated integration testing with Testcontainers.
- CI/CD using GitHub Actions.
- Cloud deployment.
- Advanced reporting and analytics.

## Author

**Samadhan Patil**

GitHub: [@samadhan-stack](https://github.com/samadhan-stack)

---

*Built as a full-stack software engineering project to explore multi-tenant architecture, backend security, inventory workflows, and modern frontend development.*