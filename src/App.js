import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Report from './Report';
import ClassesPage from './ClassesPage';
import './App.css';

export const AuthContext = createContext({
  studentID: 0,
  setStudentID: () => {},
  handleLogout: () => {}
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [studentID, setStudentID] = useState(0);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentID(0);
  };

  return (
    <Router>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, studentID, setStudentID, handleLogout }}>
        <div className="App">
          <Routes>
            <Route path="/classes_page" element={isLoggedIn ? <ClassesPage /> : <LoginForm />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/" element={<LoginForm />} />
      
          </Routes>
        </div>
      </AuthContext.Provider>
    </Router>
  );
}

function LoginForm() {
  const { setIsLoggedIn, setStudentID } = useContext(AuthContext);
  const [studentID, setLocalStudentID] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('');
  const [gpa, setGpa] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const studentData = {
      studentID,
      name,
      major,
      grade,
      gpa
    };
  
    fetch('http://localhost:5000/api/addStudent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setIsLoggedIn(true);
        setStudentID(studentID);
        navigate('/classes_page');
      } else {
        console.error('Failed to add student:', data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="login-form">
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Student ID (10 digits starting with 00)</label>
          <input 
            type="text"
            value={studentID}
            onChange={(e) => setLocalStudentID(e.target.value)}
            maxLength="10"
            pattern="\d{10}"
            title="Please enter a 10-digit student ID"
            required
          />
        </div>
        <div className="input-group">
          <label>Name</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Major</label>
          <input 
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Grade</label>
          <select 
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          >
            <option value="" disabled>Select your grade</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
        <div className="input-group">
          <label>GPA (out of 4)</label>
          <input 
            type="number"
            step="any"
            min="0"
            max="4"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}

export default App;