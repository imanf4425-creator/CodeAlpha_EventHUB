# Event Registration System — Node.js REST API

A full-featured backend API for managing events and user registrations, built with **Node.js**, **Express**, **PostgreSQL**, and **JWT authentication**.

---

## Tech Stack

- Node.js 18+
- Express 4.18
- PostgreSQL (via `pg` — raw SQL, no ORM)
- JSON Web Tokens (`jsonwebtoken`)
- bcryptjs (password hashing)
- dotenv, cors, nodemon

---

## Project Structure

```
event_registration_node/
├── package.json
├── .env.example
├── src/
│   ├── server.js              — entry point
│   ├── app.js                 — Express app, middleware, routes
│   ├── config/
│   │   └── db.js              — PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js            — JWT verification (protect routes)
│   │   └── isOrganizer.js     — organizer role check
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── events.routes.js
│   │   └── registrations.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── events.controller.js
│   │   └── registrations.controller.js
│   └── db/
│       └── schema.sql         — SQL to create all tables
```

---

## Setup Instructions

### 1. Install dependencies

```bash
cd event_registration_node
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_db
DB_USER=postgres
DB_PASSWORD=password
```

### 3. Create the PostgreSQL database

```sql
CREATE DATABASE event_db;
```

### 4. Run the schema

```bash
psql -U postgres -d event_db -f src/db/schema.sql
```

### 5. Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`.

---

## API Endpoints

### Authentication — `/api/auth`

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | No | Register a new user. Returns JWT tokens. |
| POST | `/api/auth/login` | No | Login with email + password. Returns JWT tokens. |
| POST | `/api/auth/token/refresh` | No | Refresh access token using refresh token. |
| GET | `/api/auth/profile` | Yes | Get authenticated user's profile. |
| PATCH | `/api/auth/profile` | Yes | Update profile (first_name, last_name, phone). |
| POST | `/api/auth/change-password` | Yes | Change password. |

### Public Events — `/api/events`

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/events` | No | List published events. Supports `?search=` and `?ordering=start_datetime`. |
| GET | `/api/events/:id` | No | Get a single published event with full details. |

### Organizer Event Management — `/api/organizer`

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/organizer/events` | Organizer | List own events. |
| POST | `/api/organizer/events` | Organizer | Create a new event. |
| GET | `/api/organizer/events/:id` | Organizer | Get a specific own event. |
| PUT/PATCH | `/api/organizer/events/:id` | Organizer | Update an event. |
| DELETE | `/api/organizer/events/:id` | Organizer | Delete an event. |

### Registrations — `/api/registrations`

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/registrations` | Yes | List my active registrations. |
| POST | `/api/registrations` | Yes | Register for an event. |
| PATCH | `/api/registrations/:id/cancel` | Yes | Cancel a registration. |

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Access tokens expire after `1d`. Use `/api/auth/token/refresh` with your refresh token to get a new one.

---

## Making a User an Organizer

Connect to your database and run:

```sql
UPDATE users SET is_organizer = true WHERE email = 'user@example.com';
```

Or via psql:

```bash
psql -U postgres -d event_db -c "UPDATE users SET is_organizer = true WHERE email = 'user@example.com';"
```

---

## Request / Response Examples

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Smith",
  "phone": "+1234567890",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
```

Response `201`:
```json
{
  "message": "Registration successful.",
  "user": { "id": 1, "email": "alice@example.com", "first_name": "Alice", "last_name": "Smith" },
  "tokens": { "access": "...", "refresh": "..." }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "alice@example.com", "password": "securepass123" }
```

### Create an Event (organizer)

```http
POST /api/organizer/events
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Node.js Workshop",
  "description": "Build REST APIs with Express and PostgreSQL.",
  "location": "Nairobi, Kenya",
  "start_datetime": "2024-08-10T09:00:00Z",
  "end_datetime": "2024-08-10T17:00:00Z",
  "capacity": 40,
  "is_published": true
}
```

### Register for an Event

```http
POST /api/registrations
Authorization: Bearer <access_token>
Content-Type: application/json

{ "event_id": 1 }
```

### Cancel a Registration

```http
PATCH /api/registrations/3/cancel
Authorization: Bearer <access_token>
```

---

## Error Responses

Validation errors (`400`):
```json
{ "errors": ["email is required.", "Passwords do not match."] }
```

Auth errors (`401`):
```json
{ "detail": "Invalid or expired token." }
```

Not found (`404`):
```json
{ "detail": "Event not found." }
```
