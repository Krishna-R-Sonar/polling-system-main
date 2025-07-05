import React from 'react';

const PollResults = ({ poll, results, isTeacher = false, showWaitMessage = false }) => {
  if (showWaitMessage) {
    return (
      <div className="poll-results">
        <div className="results-header">
          <h3>Question</h3>
        </div>
        <div className="question-display">
          <h2>{poll?.question}</h2>
        </div>
        <div className="waiting-results">
          <div className="loading-spinner"></div>
          <p>Wait for the teacher to ask a new question.</p>
        </div>
      </div>
    );
  }

  if (!poll || !results) {
    return (
      <div className="poll-results">
        <div className="empty-state">
          <p>No poll results to display</p>
        </div>
      </div>
    );
  }

  const totalVotes = results.reduce((sum, result) => sum + result.count, 0);
  const maxVotes = Math.max(...results.map(r => r.count));

  return (
    <div className="poll-results">
      <div className="results-header">
        <h3>Question</h3>
        {poll.endedAt && (
          <span className="poll-status ended">Poll Ended</span>
        )}
      </div>

      <div className="question-display">
        <h2>{poll.question}</h2>
      </div>

      <div className="results-container">
        <div className="results-list">
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-header">
                <span className="option-text">{result.option}</span>
                <div className="result-stats">
                  <span className="vote-count">{result.count}</span>
                  <span className="percentage">{result.percentage}%</span>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${result.count === maxVotes && result.count > 0 ? 'winner' : ''}`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="results-summary">
          <div className="summary-item">
            <span className="summary-label">Total Votes:</span>
            <span className="summary-value">{totalVotes}</span>
          </div>
          
          {poll.endedAt && (
            <div className="summary-item">
              <span className="summary-label">Ended:</span>
              <span className="summary-value">
                {new Date(poll.endedAt).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {isTeacher && poll.isActive && (
        <div className="teacher-actions">
          <p className="action-hint">Wait for the teacher to ask a new question.</p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
