const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'Kdre#65P', 
  database: 'taskmanager'
});
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

const JWT_SECRET = process.env.JWT_SECRET || 'Avinashknowthepassword';

// making a middleware to verify the token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// this is for user registration portal
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// user login portion
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// getting all tasks from user
app.get('/api/tasks', authenticateToken, (req, res) => {
  const sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';
  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// creating anew task
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  const sql = 'INSERT INTO tasks (title, description, status, priority, due_date, user_id) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [title, description, status, priority, due_date, req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, message: 'Task created successfully' });
  });
});

// updating a task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  const sql = 'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?';
  
  db.query(sql, [title, description, status, priority, due_date, req.params.id, req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// deleting a task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
  
  db.query(sql, [req.params.id, req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
