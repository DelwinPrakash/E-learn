# E-Learn Platform

## Project Information
This is a full-stack E-Learning application featuring a comprehensive backend and a responsive frontend interface. The project integrates traditional database architecture with real-time communication capabilities and advanced AI features using Google's Generative AI and AssemblyAI.

## Technologies Used

### Frontend
- **Framework:** Angular 16
- **Routing:** Angular Router
- **Additional Libraries:** AssemblyAI, ngx-markdown, RxJS
- **Real-time Client:** Socket.io Client

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database ORM:** Sequelize
- **Security:** bcrypt, jsonwebtoken
- **Real-time Communication:** Socket.io
- **AI Integrations:** Google Generative AI (Gemini), AssemblyAI

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL 16

## Prerequisites
Before running the application, make sure you have the following installed on your machine:
- [Docker & Docker Compose](https://www.docker.com/) (Recommended for easy and consistent setup)
- Node.js (v18+) and npm (If running locally without Docker)
- Angular CLI (`npm install -g @angular/cli`)

## Environment Variables

You need to set up the appropriate environment variables before running the application.
Ensure you have a `.env` file inside the project root and `backend` directory (as required by docker-compose) containing your required database variables, JWT secrets, and any API keys (Gemini, AssemblyAI):


`./.env`
```env
POSTGRES_NAME=your_postgres_name
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_PORT=5432
```

`./backend/.env`
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=e_learning
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
EMAIL_ID=e.learning.webapp.platform@gmail.com
EMAIL_PASSWORD=your_email_password
FRONTEND_BASE_URL=http://localhost:4200
GEMINI_API_KEY=your_gemini_api_key
```

To configure other variables properly, please refer to the `backend/.env` template if one is provided.

## How to Run the Application

### Method 1: Using Docker Compose (Recommended)
This is the easiest way to launch the entire stack simultaneously (Frontend, Backend API, and PostgreSQL Database).

1. Open a terminal at the root of the project.
2. Run the following command up the infrastructure:
   ```bash
   docker compose up --build
   ```
3. The services will be started and exposed on the following ports:
   - **Frontend:** http://localhost:4200
   - **Backend API:** http://localhost:3000
   - **Database (PostgreSQL):** Accessible on local port `5433` (maps to container port `5432`)

To run the stack in detached mode (in the background without occupying the terminal window), use:
```bash
docker compose up -d
```

### Method 2: Running Locally (Without Docker)

You can also run the backend, frontend, and database services independently directly on your host machine:

#### 1. Database
Ensure your local PostgreSQL service is running and configured correctly. Create the database to fulfill the `POSTGRES_NAME` variable exactly as you set it in your local `.env` and connection config. A local PostgreSQL database typically runs on port `5432`.

#### 2. Backend
Open a terminal and navigate to the `backend` directory to install dependencies and start the Node process:
```bash
cd backend
npm install
node server.js
```
The backend API server will start on default port http://localhost:3000.

#### 3. Frontend
Open another terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
ng serve
```
The Angular development server will start the application on http://localhost:4200.

## Useful Docker Commands

- To stop the Docker setup safely:
  ```bash
  docker compose down
  ```
- To view the logs of your running frontend or backend service in Docker:
  ```bash
  docker compose logs -f frontend
  # or
  docker compose logs -f backend
  ```
