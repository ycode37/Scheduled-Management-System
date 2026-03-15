# SimpliTask Pro

![App Preview](./screenshots/dashboard-img.png)

A full stack task management app that helps users organise work across projects. It evolves a frontend-only React app into a production-style system with a REST API, user authentication, and persistent PostgreSQL data, demonstrating real frontend–backend integration.

Github repo link  
https://github.com/HReid17/simplitask-pro

---

## Application Screenshots

### Dashboard

![Dashboard](./screenshots/dashboard-img.png)

---

### Tasks Page

![Tasks](./screenshots/tasks-img.png)

---

### Projects Page

![Projects](./screenshots/projects-img.png)

---

### Calendar View

![Calendar](./screenshots/calendar-img.png)

---

## Tech Stack

### Frontend
- React
- Redux Toolkit
- Vite
- React Router
- CSS

### Backend
- Node.js
- Express

### Database
- PostgreSQL

### Other
- JWT Authentication
- Bcrypt
- Zod validation
- Swagger API docs
- Vitest + React Testing Library
- Render deployment

---

## Features

- User authentication (JWT)
- Create / edit / delete tasks
- Create / manage projects
- Assign tasks to projects
- Dashboard overview
- Calendar view of tasks
- Search functionality
- Protected routes
- Responsive UI

---

## Installation Instructions

Follow the steps below to run the application locally.

### Clone the repository

```bash
git clone https://github.com/HReid17/simplitask-pro.git
cd simplitask-pro
```

---

### Install dependencies

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd client
npm install
```

---

### Environment variables

Create a `.env` file inside the **client** directory:

```
VITE_API_URL=http://localhost:5000
```

Create a `.env` file inside the **server** directory:

```
PORT=5000
DATABASE_URL=postgresql://postgres:Harrison11@localhost:5432/simplitask_pro
JWT_SECRET=mysecret123
JWT_EXPIRES_IN=1h
```

---

### Database setup

Ensure PostgreSQL is installed and running.

Create a database named:

```
simplitask_pro
```

Run the migration files:

```
001_create_users.sql
002_create_projects.sql
003_create_tasks.sql
004_alter_users_add_username.sql
```

These migrations create the following tables:

- users
- projects
- tasks

Relationship structure:

```
users → projects → tasks
```

---

### Start the backend server

Navigate to the **server** directory:

```bash
npm run dev
```

The backend API will run on:

```
http://localhost:5000
```

---

### Start the frontend

Open another terminal and navigate to the **client** directory:

```bash
npm run dev
```

The frontend will run on:

```
http://localhost:5173
```

---

### Open the application

Open your browser and visit:

```
http://localhost:5173
```

You can now register a user and begin using the application.

---

## API Overview

### Auth

POST /api/auth/register – register a user  
POST /api/auth/login – login a user  
GET /api/auth/me – get users details

---

### Tasks

GET /api/tasks - Get all tasks belonging to the authenticated user  
POST /api/tasks - Create a new task  
GET /api/tasks/:id - Get a single task by id  
PUT /api/tasks/:id - Update an existing task  
DELETE /api/tasks/:id – Delete a task

---

### Projects

GET /api/projects – Get all projects  
POST /api/projects - Create a new project  
GET /api/projects/:id/tasks - Get all tasks belonging to a specific project  
GET /api/projects/:id - Get a single project by id  
PUT /api/projects/:id - Update an existing project  
DELETE /api/projects/:id – Delete a project

---

## Testing

Tested backend with:

- Jest
- Supertest

Routes tested:

- Auth
- Projects
- Tasks

Tested frontend with:

- Vitest
- React Testing Library

Components tested:

- Auth
- Dashboard
- Tasks
- Projects
- Calendar
- Protected routes

---

## What I Learned

- Connecting a React frontend to a REST API
- Implementing JWT authentication
- Managing global state with Redux Toolkit
- Writing reusable React components
- Testing React applications
- Designing PostgreSQL schemas
- Using Swagger

This project helped me understand how to evolve a frontend-only application into a full stack application with a backend API, authentication, database persistence, and testing across both layers.

---

## Future Improvements

- Drag and drop task ordering
- Team collaboration
- Notifications
- Dark mode
- Mobile responsiveness improvements
- Auth page login / register
- Loading states

---

## Author

Harrison Reid  
Aspiring Software Developer

GitHub profile  
https://github.com/HReid17