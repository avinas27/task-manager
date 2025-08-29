import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  });
  const [authData, setAuthData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Setting up axios with auth token if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
      fetchTasks();
    }
  }, []);

  // Fetching tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Had trouble getting tasks:', error);
    }
  };

  // Getting user info from the token
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Just decoding the JWT token to get basic user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        setUser(JSON.parse(jsonPayload));
      }
    } catch (error) {
      console.error('Problem getting user info:', error);
    }
  };

  // Handling new user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', authData);
      alert('All set! You can now login.');
      setIsRegistering(false);
      setAuthData({ username: '', email: '', password: '' });
    } catch (error) {
      console.error('Registration didn\'t work:', error);
      alert('Something went wrong with registration. Maybe try a different email?');
    }
  };

  // Handling user login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: authData.email,
        password: authData.password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      fetchTasks();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Check your email and password and try again.');
    }
  };

  // Logging out and clearing everything
  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setTasks([]);
  };

  // Adding a new task
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', formData);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: ''
      });
      fetchTasks();
    } catch (error) {
      console.error('Couldn\'t create the task:', error);
    }
  };

  // Removing a task
  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Had trouble deleting the task:', error);
    }
  };

  // Show login/register screen if no user is logged in
  if (!user) {
    return (
      <div className="App">
        {/* Header with branding */}
        <header className="app-header">
          <div className="branding">
            <h1>Task Manager</h1>
            <p className="developer-name">Developed by Avinash</p>
          </div>
        </header>

        <div className="auth-container">
          <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <input
                type="text"
                placeholder="Choose a username"
                value={authData.username}
                onChange={(e) => setAuthData({...authData, username: e.target.value})}
                required
              />
            )}
            <input
              type="email"
              placeholder="Your email"
              value={authData.email}
              onChange={(e) => setAuthData({...authData, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={(e) => setAuthData({...authData, password: e.target.value})}
              required
            />
            <button type="submit">{isRegistering ? 'Sign Up' : 'Login'}</button>
          </form>
          <p className="auth-switch">
            {isRegistering ? 'Already have an account?' : "New here?"}
            <button onClick={() => setIsRegistering(!isRegistering)} className="switch-btn">
              {isRegistering ? 'Login instead' : 'Create account'}
            </button>
          </p>
        </div>

        {/* Footer with branding */}
        <footer className="app-footer">
          <p>© 2024 Task Manager | Created by Avinash</p>
        </footer>
      </div>
    );
  }

  // Main app view when user is logged in
  return (
    <div className="App">
      {/* Header with user info and branding */}
      <header className="app-header">
        <div className="branding">
          <h1>Task Manager</h1>
          <p className="developer-name">Developed by Avinash</p>
        </div>
        <div className="user-info">
          <span>Hey, {user.username || user.email}!</span>
          <button onClick={handleLogout} className="logout-btn">Sign Out</button>
        </div>
      </header>

      {/* Form to add new tasks */}
      <div className="task-form">
        <h2>Add New Task</h2>
        <form onSubmit={handleTaskSubmit}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <textarea
            placeholder="More details (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
          >
            <option value="low">Not urgent</option>
            <option value="medium">Medium priority</option>
            <option value="high">Get this done!</option>
          </select>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            placeholder="Due date (optional)"
          />
          <button type="submit" className="add-task-btn">Add to My Tasks</button>
        </form>
      </div>

      {/* List of all tasks */}
      <div className="tasks-list">
        <h2>Your Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="no-tasks">Nothing here yet! Add your first task above.</p>
        ) : (
          <ul>
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.priority}`}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-meta">
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority} priority
                  </span>
                  <span className={`status status-${task.status}`}>
                    {task.status}
                  </span>
                  {task.due_date && (
                    <span className="due-date">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="delete-btn"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2024 Task Manager | Created by Avinash</p>
      </footer>
    </div>
  );
}

export default App;