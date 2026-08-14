# Scheduled Management System

A full-stack project & task management app with a calendar-based scheduling view. Users can register/log in, create projects, break them down into tasks, and see everything laid out on an interactive calendar.

**Live demo:** https://scheduled-management-system.vercel.app

<!-- 🖼️ IMAGE: Add a hero screenshot/banner of the app here -->
![App Screenshot](./docs/images/hero.png)

---

## ✨ Features

- 🔐 **Authentication** — register/login with JWT-based auth
- 📁 **Project management** — create, update, and organize projects
- ✅ **Task management** — create tasks, assign them to projects, track status
- 📅 **Calendar view** — visualize tasks/schedules on a full calendar (day/week/month) powered by FullCalendar
- 📊 **Dashboard** — at-a-glance overview of projects and tasks
- 🔎 **Search** — quickly find projects/tasks
- 📖 **API documentation** — interactive Swagger UI for the backend API
- 🧪 **Tested** — unit/integration tests on both client (Vitest) and server (Jest)

<!-- 🖼️ IMAGE: Add a screenshot of the Dashboard here -->
![Dashboard](./docs/images/dashboard.png)

<!-- 🖼️ IMAGE: Add a screenshot of the Calendar view here -->
![Calendar View](./docs/images/calendar.png)

<!-- 🖼️ IMAGE: Add a screenshot of the Projects page here -->
![Projects Page](./docs/images/projects.png)

<!-- 🖼️ IMAGE: Add a screenshot of the Tasks page here -->
![Tasks Page](./docs/images/tasks.png)

<!-- 🖼️ IMAGE: Add a screenshot of the Login/Register page here -->
![Auth Page](./docs/images/auth.png)

---

## 🛠️ Tech Stack

**Frontend (`/client`)**
- React 19 + Vite
- React Router
- Redux Toolkit / React-Redux
- FullCalendar (day grid, time grid, interaction)
- Vitest + Testing Library for tests
- ESLint

**Backend (`/server`)**
- Node.js + Express 5
- PostgreSQL (`pg`)
- JWT authentication (`jsonwebtoken`) + `bcrypt` for password hashing
- Zod for request validation
- Swagger (`swagger-jsdoc` + `swagger-ui-express`) for API docs
- Jest + Supertest for tests

---

## 📂 Project Structure

```
Scheduled-Management-System/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # API client setup
│   │   ├── app/            # Redux store
│   │   ├── auth/           # Auth context & protected routes
│   │   ├── components/     # Shared UI components (Sidebar, TopBar, etc.)
│   │   ├── features/       # Feature modules (auth, dashboard, projects, tasks, calendar)
│   │   └── tests/          # Frontend tests
│   └── package.json
│
└── server/                 # Express backend
    ├── src/
    │   ├── controllers/    # Route handlers (auth, projects, tasks)
    │   ├── routes/         # Express routers
    │   ├── services/       # Business logic
    │   ├── validators/     # Zod request validation schemas
    │   ├── middleware/     # Auth middleware, validation middleware
    │   ├── db/              # DB pool + migrations
    │   └── docs/            # Swagger config
    ├── tests/               # Backend tests
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/ycode37/Scheduled-Management-System.git
cd Scheduled-Management-System
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```env
PORT=5000
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
JWT_SECRET=your_jwt_secret_here
```

Run the database migrations (see `server/src/db/migrations` and `server/src/docs/000_schema_migrations.sql`) against your PostgreSQL instance, then start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

---

## 📖 API Documentation

Once the server is running, interactive API docs (Swagger UI) are available at:

```
http://localhost:5000/api-docs
```

<!-- 🖼️ IMAGE: Add a screenshot of the Swagger API docs here -->
![API Docs](./docs/images/api-docs.png)

---

## 🧪 Running Tests

**Frontend**
```bash
cd client
npm run test
```

**Backend**
```bash
cd server
npm run test
```

---

## 🗺️ Roadmap / Ideas

- [ ] Notifications/reminders for upcoming tasks
- [ ] Team collaboration & task assignment to other users
- [ ] Drag-and-drop task rescheduling on the calendar
- [ ] Dark mode

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch and open a PR

---
