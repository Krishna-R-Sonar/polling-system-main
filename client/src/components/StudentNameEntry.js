import React, { useState } from 'react';

const StudentNameEntry = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    setError('');
    onJoin(name.trim());
  };

  return (
    <div className="name-entry">
      <div className="name-entry-container">
        <div className="header">
          <div className="student-badge">Student</div>
          <h1>Let's Get Started</h1>
          <p>Enter your name to join the live polling session and start participating in real-time questions.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="name-form">
          <div className="form-group">
            <label htmlFor="student-name">Enter your Name</label>
            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className={error ? 'error' : ''}
              maxLength={50}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
          
          <button type="submit" className="btn btn-primary">
            Join Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentNameEntry;
