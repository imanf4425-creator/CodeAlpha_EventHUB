# 🎟 EventHub - Event Registration & Management System

A comprehensive full-stack event management platform built with **Node.js**, **Express**, **React**, and **PostgreSQL**. EventHub allows users to browse and register for events, organizers to create and manage events, and admins to oversee the entire platform with an approval workflow.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🎭 **User Features**
- Browse local and global events
- Register for events with payment proof upload
- View live sports events and calendars
- Manage event registrations (view, cancel)
- User profile management
- Dashboard with registration statistics

### 🎙 **Organizer Features**
- Create and manage events
- Set event details (title, description, location, date, capacity)
- Configure ticket pricing and payment methods
- View event analytics and statistics
- Verify payment proofs from attendees
- Track ticket sales and revenue
- View detailed attendee lists
- **Event approval system** - Events require admin approval before going live

### ⚙️ **Admin Features**
- Complete platform oversight
- **Approve/Reject organizer events** with reasons
- User management (promote to organizer, disable accounts)
- Event management (view all, delete)
- Registration monitoring
- Platform statistics dashboard
- Access to all user features (browse events, sports, etc.)

### 🌐 **Additional Features**
- Real-time updates with Socket.io
- Global events integration (Ticketmaster API)
- Live sports data (TheSportsDB API)
- Sports calendar with league information
- Responsive design for all devices
- Role-based authentication and authorization
- Secure file upload for payment proofs
- Event approval workflow with admin oversight

---

## 🛠 Tech Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Scoped styling
- **Socket.io Client** - Real-time updates

### **Database**
- **PostgreSQL 14+** - Primary database
- Custom migration system
- Structured schema with foreign keys

### **External APIs**
- **Ticketmaster API** - Global events data
- **TheSportsDB API** - Live sports information

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      EventHub System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐    ┌─────────────┐ │
│  │   Frontend   │◄────►│   Backend    │◄──►│  PostgreSQL │ │
│  │  (React +    │      │  (Node.js +  │    │  Database   │ │
│  │   Vite)      │      │   Express)   │    │             │ │
│  └──────────────┘      └──────────────┘    └─────────────┘ │
│         │                      │                             │
│         │                      │                             │
│         ▼                      ▼                             │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  Socket.io   │◄────►│  Socket.io   │                    │
│  │   Client     │      │   Server     │                    │
│  └──────────────┘      └──────────────┘                    │
│                                │                             │
│                                ▼                             │
│                        ┌──────────────┐                     │
│                        │  External    │                     │
│                        │  APIs        │                     │
│                        │  - Ticketmstr│                     │
│                        │  - SportsDB  │                     │
│                        └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **PostgreSQL** (v14+)
- **Git**
- A code editor (VS Code recommended)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/imanf4425-creator/CodeAlpha_Project_1.git
cd CodeAlpha_Project_1
```

### 2. Install Backend Dependencies

```bash
cd event_registration_node
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../event_registration_frontend
npm install
```

---

## 🔧 Environment Setup

### Backend Environment Variables

Create `.env` file in `event_registration_node/`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Frontend Environment Variables

Create `.env` file in `event_registration_frontend/`:

```env
# Backend API
VITE_API_URL=http://localhost:3000

# External APIs (Optional - for Global Events & Sports)
VITE_TICKETMASTER_API_KEY=your_ticketmaster_api_key
VITE_SPORTSDB_API_KEY=your_sportsdb_api_key
```

---

## 🗄 Database Setup

### 1. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE event_db;

# Exit
\q
```

### 2. Run Database Migrations

The project includes 4 migration files that set up the complete database schema:

```bash
cd event_registration_node

# Run migration 1: Schema creation
node run-migration.js
```

**Note:** Update `run-migration.js` to point to each migration file sequentially:
- `001_schema.sql` - Creates all tables
- `002_seed.sql` - Seeds initial data
- `003_payment_system.sql` - Adds payment features
- `004_event_approval.sql` - Adds event approval workflow

**Migration Files Location:** `event_registration_node/src/db/`

### Database Schema Overview

**Tables Created:**
- `tbl_users` - User accounts (admin, organizer, regular users)
- `tbl_event_categories` - Event category definitions
- `tbl_events` - Event information with approval status
- `tbl_registrations` - User event registrations with payment verification
- `tbl_notifications` - System notifications

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd event_registration_node
npm run dev
```

Backend will run on: `http://localhost:3000`

### Start Frontend Development Server

```bash
cd event_registration_frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000`

---

## 👥 User Roles

### 1️⃣ **Admin**
- **Email:** `iman.fatima@eventhub.com`
- **Password:** `admin123`
- **Access:** Full platform control, event approval, user management

### 2️⃣ **Organizer**
- **Register as Organizer** during signup
- **Access:** Create events, verify payments, view analytics
- **Note:** Events require admin approval before going live

### 3️⃣ **Regular User**
- **Register as User** during signup
- **Access:** Browse events, register for events, manage registrations

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get current user |

### Event Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events` | List public approved events | Public |
| GET | `/events/:id` | Get single approved event | Public |
| GET | `/organizer/events` | List organizer's events | Organizer |
| POST | `/organizer/events` | Create event (pending approval) | Organizer |
| PATCH | `/organizer/events/:id` | Update event | Organizer |
| DELETE | `/organizer/events/:id` | Delete event | Organizer |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Platform statistics | Admin |
| GET | `/admin/pending-events` | List pending events | Admin |
| PATCH | `/admin/events/:id/approve` | Approve event | Admin |
| PATCH | `/admin/events/:id/reject` | Reject event with reason | Admin |
| GET | `/admin/users` | List all users | Admin |
| PATCH | `/admin/users/:id` | Update user role | Admin |

### Registration Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/registrations` | User's registrations | User |
| POST | `/registrations` | Register for event | User |
| PATCH | `/registrations/:id/cancel` | Cancel registration | User |

### Organizer Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/organizer/analytics` | Event analytics | Organizer |
| GET | `/organizer/pending-verifications` | Payment verifications | Organizer |
| PATCH | `/organizer/registrations/:id/verify` | Verify payment | Organizer |

---

## 📁 Project Structure

```
CodeAlpha_Project_1/
│
├── event_registration_node/           # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL connection
│   │   │   └── multer.js             # File upload config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Authentication logic
│   │   │   ├── events.controller.js  # Event CRUD
│   │   │   ├── admin.controller.js   # Admin operations
│   │   │   ├── organizer.controller.js # Organizer features
│   │   │   └── registrations.controller.js # Registration logic
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── events.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── organizer.routes.js
│   │   │   └── registrations.routes.js
│   │   ├── db/
│   │   │   ├── 001_schema.sql        # Initial schema
│   │   │   ├── 002_seed.sql          # Seed data
│   │   │   ├── 003_payment_system.sql # Payment features
│   │   │   └── 004_event_approval.sql # Approval system
│   │   ├── socket.js                 # Socket.io setup
│   │   └── server.js                 # Express server
│   ├── uploads/                      # Payment proof uploads
│   ├── package.json
│   └── run-migration.js              # Database migration runner
│
├── event_registration_frontend/       # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js              # Axios configuration
│   │   │   ├── ticketmaster.js       # Ticketmaster API
│   │   │   └── sportsdb.js           # Sports API
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── AdminRoute.jsx        # Admin route guard
│   │   │   └── OrganizerRoute.jsx    # Organizer route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication state
│   │   ├── pages/
│   │   │   ├── admin/                # Admin pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── PendingEvents.jsx  # Event approval
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── AdminEvents.jsx
│   │   │   │   └── AdminRegistrations.jsx
│   │   │   ├── organizer/            # Organizer pages
│   │   │   │   ├── OrganizerDashboard.jsx
│   │   │   │   ├── MyEvents.jsx
│   │   │   │   ├── EventForm.jsx
│   │   │   │   ├── OrganizerAnalytics.jsx
│   │   │   │   └── PendingVerifications.jsx
│   │   │   ├── user/                 # User pages
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── MyRegistrations.jsx
│   │   │   ├── Landing.jsx           # Landing page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration page
│   │   │   ├── Home.jsx              # Browse events
│   │   │   ├── EventDetail.jsx       # Event details
│   │   │   ├── GlobalEvents.jsx      # Global events
│   │   │   ├── LiveSports.jsx        # Live sports
│   │   │   └── SportsCalendar.jsx    # Sports calendar
│   │   ├── styles/                   # CSS Modules
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   └── index.html
│
├── .kiro/                            # Kiro spec files
│   └── specs/
│       └── organizer-dashboard-enhancement/
│
└── README.md                         # This file
```

---

## 🖼 Screenshots

### Landing Page
Beautiful landing page with role selection (User, Organizer, Admin).

### User Dashboard
View active registrations, browse events, and manage profile.

### Organizer Dashboard
Create events, view analytics, verify payments, and track revenue.
Events show approval status (Pending/Approved/Rejected).

### Admin Dashboard
Complete platform overview with pending event approvals, user management, and statistics.

### Event Approval System
Admin can review pending events from organizers and approve/reject with reasons.

### Global Events & Sports
Integration with external APIs for global events and live sports data.

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **Role-Based Access Control** - Admin, Organizer, User roles
- **CORS Protection** - Configured for frontend-backend communication
- **SQL Injection Prevention** - Parameterized queries
- **File Upload Validation** - Type and size checks
- **Environment Variables** - Sensitive data protection

---

## 🚀 Deployment

### Backend Deployment (Recommended: Railway, Heroku, or AWS)

1. Set environment variables on hosting platform
2. Update `FRONTEND_URL` to production frontend URL
3. Ensure PostgreSQL database is accessible
4. Run migrations on production database
5. Deploy backend code

### Frontend Deployment (Recommended: Vercel, Netlify, or AWS S3)

1. Update `VITE_API_URL` to production backend URL
2. Build for production: `npm run build`
3. Deploy `dist/` folder

### Database Deployment

- Use managed PostgreSQL (AWS RDS, Railway PostgreSQL, etc.)
- Run all 4 migration files in order
- Ensure firewall rules allow backend connection

---

## 📝 Key Features Explained

### Event Approval Workflow

1. **Organizer creates event** → Status: `pending`
2. **Admin reviews event** → Can approve or reject
3. **If approved** → Event visible to all users
4. **If rejected** → Organizer sees rejection reason, can edit and resubmit

### Payment Verification System

1. **User registers for event** → Uploads payment proof
2. **Organizer reviews proof** → Approve or reject
3. **If approved** → User receives confirmation
4. **Ticket generation** → User gets ticket with QR code

### Real-Time Updates

- Socket.io broadcasts event changes
- New events appear instantly for all users
- Event updates reflect immediately
- Live notifications for organizers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Iman Fatima**
- GitHub: [@imanf4425-creator](https://github.com/imanf4425-creator)
- Email: imanf4425@gmail.com

---

## 🙏 Acknowledgments

- **CodeAlpha Internship** - For the project opportunity
- **Ticketmaster API** - Global events data
- **TheSportsDB API** - Live sports information
- **React Community** - For excellent documentation
- **Node.js Community** - For robust backend tools

---

## 📞 Support

For support, email iman.fatima@eventhub.com or create an issue in this repository.

---

## 🎯 Future Enhancements

- [ ] Email notifications for event approvals
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] QR code ticket scanning
- [ ] Event reviews and ratings
- [ ] Social media sharing
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Event recommendations based on user preferences

---

<div align="center">

**Made with ❤️ by Iman Fatima for CodeAlpha Internship**

⭐ Star this repo if you found it helpful!

</div>
