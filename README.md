A full-stack task management application built with React, Node.js, and MySQL.
 Features
-  User authentication (Register/Login)
-  Create, read, update, and delete tasks
-  Organize tasks by priority (Low, Medium, High)
-  Set due dates for tasks
-  Track task status (Pending, In Progress, Completed)
-  Clean and responsive UI
-  Secure JWT authentication
-  MySQL database integration

-  Tech Stack

**Frontend:**
- React.js
- Axios for API calls
- CSS3 for styling
- Context API for state management

**Backend:**
- Node.js
- Express.js
- MySQL2 database driver
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server
- Git

- 
 **Clone the repository**
   ```bash
   git clone https://github.com/your-username/task-manager.git
   cd task-manager
Set up the database

Start MySQL server

Create database taskdb

Import the SQL schema from database/schema.sql

Set up backend

bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
Set up frontend (in a new terminal)

bash
cd client
npm install
npm start
Open your browser
Navigate to http://localhost:3000
**Database:**
- MySQL
- User and task tables with proper relationships
