# Gym Management System

A full-stack web application to manage gym operations — including membership registration, employee management, trainer bookings, salary payments, and reporting.  
Built with **Next.js** (React) on the frontend and **Express.js** (Node.js) on the backend.

---

## ✨ Features

- **Authentication**: Employees (Manager, Receptionist, Trainer) can log in securely.
- **Member Management**: Register, edit, and manage gym members.
- **Cost Management**: Define and manage service fees (e.g., treadmill, cycling) for different durations (1 month, 6 months, 1 year).
- **Employee Salary Management**: Pay salaries, track work days, and manage unpaid salaries.
- **Trainer Management**: View trainers, their details, and personal training session requests.
- **Personal Training Booking**: Receptionists can request trainers for personal training sessions; trainers can accept/reject requests.
- **Reports**: Generate reports for user counts, salary payments, and filter by time periods (week, month, lifetime).
- **Role-based Access**: Manager, Receptionist, and Trainer roles with different permissions.

---

## 🛠 Technologies Used

- **Frontend**: [Next.js](https://nextjs.org/), Tailwind CSS
- **Backend**: [Express.js](https://expressjs.com/), Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: Redux
- **Other Tools**: Axios, dotenv, etc.

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```
### 2. Start the Client (Frontend - Next.js)

```bash
cd client
npm install
npm run dev
```
The frontend will be running at http://localhost:3000.

### 3. Start the Server (Backend - Express.js)
Open a new terminal window, then:

```bash
cd server
npm install
npm run dev
```
The backend will be running at http://localhost:3001

### 4. ⚙️ Environment Variables
You need to create .env files for both client and server.

Example for /server/.env:
```env
# ---------------------------
# Server Configuration
# ---------------------------
PORT=3001
NODE_ENV=development # (development|production)

# ---------------------------
# Database Configuration
# ---------------------------
DB_HOST=your-host-name
DB_PORT=your-post-database
DB_USER=your-post-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
# ---------------------------
# JWT Configuration
# ---------------------------
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=your-jwt-expires-in
```
Example for /client/.env:
```env
NODE_ENV=development
SERVER_URL=http://localhost:3001
```
### 5. Project Structure
```pgsql
/client    --> Frontend (Next.js App)
/server    --> Backend (Express.js Server)
```


