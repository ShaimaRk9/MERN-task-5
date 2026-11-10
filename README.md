# MERN Multi-User Notes Management System

A full-stack Notes Management System built using the MERN stack. It supports user authentication, personal note management, and administrator access.

## Features

### User
- User registration and login
- JWT-based authentication
- Create, view, edit and delete personal notes
- Search notes by title or content
- Filter notes by tags
- Paginated notes listing
- View personal profile
- Logout

### Admin
- Admin dashboard with statistics
- View registered users
- Search users
- View all notes
- Delete any user's note

### Security
- Password hashing
- Protected API routes
- Role-based authorization
- Input validation
- Rate limiting on authentication routes
- CORS configuration
- Centralized error handling

## Tech Stack

- MongoDB
- Express.js
- React.js
- Node.js
- JWT
- Axios
- CSS

## Project Structure

```text
mern-task-5/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   └── services/
│   └── .env
│
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd mern-task-5
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## Application URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get logged-in user |
| POST | `/api/notes` | Create note |
| GET | `/api/notes` | Get notes |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/admin/stats` | Admin statistics |
| GET | `/api/admin/users` | Get registered users |

## Security Note

Never upload `.env` files, database credentials, JWT secrets, or private keys to GitHub.

## Author

Add your name and project details here.