import React, { useState } from 'react';

const RoleSelection = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="role-selection">
      <div className="role-selection-container">
        <div className="header">
          <div className="intervus-badge">
            <span className="badge-icon">📊</span>
            <span>Intervue Poll</span>
          </div>
          <h1>Welcome to the <span className="highlight">Live Polling System</span></h1>
          <p>Please select the role that best describes you to begin using the live polling system</p>
        </div>

        <div className="role-cards">
          <div
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleClick('student')}
          >
            <h3>I'm a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>

          <div
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleClick('teacher')}
          >
            <h3>I'm a Teacher</h3>
            <p>Submit answers and view live poll results in real-time.</p>
          </div>
        </div>

        <button
          className={`btn btn-continue ${selectedRole ? 'enabled' : 'disabled'}`}
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
