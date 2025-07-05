import React, { useState } from 'react';
import PollCreation from './PollCreation';
import PollResults from './PollResults';

const TeacherDashboard = ({ currentPoll, students, pollResults, onCreatePoll, onKickStudent }) => {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);

  const canCreateNewPoll = () => {
    if (!currentPoll) return true;
    if (!currentPoll.isActive) return true;
    return students.every(student => student.hasAnswered);
  };

  const handleCreatePoll = (pollData) => {
    onCreatePoll(pollData);
    setShowCreatePoll(false);
  };

  const fetchPollHistory = async () => {
    try {
      const response = await fetch('/api/poll-history');
      const history = await response.json();
      setPollHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to fetch poll history:', error);
    }
  };

  const answeredCount = students.filter(s => s.hasAnswered).length;
  const totalStudents = students.length;

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <h1>Teacher Dashboard</h1>
        <div className="teacher-badge">Teacher</div>
      </div>

      <div className="dashboard-content">
        {/* Students Panel */}
        <div className="students-panel">
          <div className="panel-header">
            <h3>Students ({totalStudents})</h3>
            {currentPoll && currentPoll.isActive && (
              <span className="answered-count">
                {answeredCount}/{totalStudents} answered
              </span>
            )}
          </div>
          
          <div className="students-list">
            {students.length === 0 ? (
              <div className="empty-state">
                <p>No students have joined yet</p>
              </div>
            ) : (
              students.map(student => (
                <div key={student.id} className="student-item">
                  <div className="student-info">
                    <span className="student-name">{student.name}</span>
                    {currentPoll && currentPoll.isActive && (
                      <span className={`answer-status ${student.hasAnswered ? 'answered' : 'pending'}`}>
                        {student.hasAnswered ? '✓ Answered' : '⏳ Waiting'}
                      </span>
                    )}
                  </div>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => onKickStudent(student.id)}
                    title="Kick student"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {showCreatePoll ? (
            <PollCreation 
              onCreatePoll={handleCreatePoll}
              onCancel={() => setShowCreatePoll(false)}
            />
          ) : showHistory ? (
            <div className="poll-history">
              <div className="history-header">
                <h3>Poll History</h3>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowHistory(false)}
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="history-list">
                {pollHistory.length === 0 ? (
                  <div className="empty-state">
                    <p>No polls have been created yet</p>
                  </div>
                ) : (
                  pollHistory.map((poll, index) => (
                    <div key={poll.id} className="history-item">
                      <h4>Question {pollHistory.length - index}</h4>
                      <p className="question-text">{poll.question}</p>
                      <div className="poll-meta">
                        <span>Created: {new Date(poll.createdAt).toLocaleString()}</span>
                        {poll.endedAt && (
                          <span>Ended: {new Date(poll.endedAt).toLocaleString()}</span>
                        )}
                      </div>
                      {poll.results && (
                        <div className="mini-results">
                          {poll.results.map((result, idx) => (
                            <div key={idx} className="mini-result">
                              <span>{result.option}</span>
                              <span>{result.count} votes ({result.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : currentPoll ? (
            <PollResults 
              poll={currentPoll} 
              results={pollResults}
              isTeacher={true}
            />
          ) : (
            <div className="welcome-content">
              <h2>Welcome to your polling session!</h2>
              <p>Create your first poll to get started with real-time student engagement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className={`btn btn-primary ${!canCreateNewPoll() ? 'disabled' : ''}`}
          onClick={() => setShowCreatePoll(true)}
          disabled={!canCreateNewPoll()}
        >
          {currentPoll && currentPoll.isActive ? 'Create New Poll' : 'Create Poll'}
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={fetchPollHistory}
        >
          View Poll History
        </button>
      </div>

      {!canCreateNewPoll() && (
        <div className="info-message">
          <p>Wait for all students to answer before creating a new poll</p>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
