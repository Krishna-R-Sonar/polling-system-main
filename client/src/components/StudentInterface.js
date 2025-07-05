import React, { useState, useEffect } from 'react';
import StudentNameEntry from './StudentNameEntry';
import PollResults from './PollResults';

const StudentInterface = ({ studentName, currentPoll, pollResults, onJoin, onSubmitAnswer }) => {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (currentPoll && currentPoll.isActive) {
      setHasAnswered(false);
      setSelectedOption(null);
      
      // Calculate time left
      const startTime = new Date(currentPoll.createdAt).getTime();
      const duration = currentPoll.timer * 1000;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));
      
      // Start countdown
      const timer = setInterval(() => {
        const newElapsed = Date.now() - startTime;
        const newRemaining = Math.max(0, duration - newElapsed);
        setTimeLeft(Math.ceil(newRemaining / 1000));
        
        if (newRemaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentPoll]);

  if (!studentName) {
    return <StudentNameEntry onJoin={onJoin} />;
  }

  const handleSubmitAnswer = () => {
    if (selectedOption !== null && !hasAnswered) {
      onSubmitAnswer(selectedOption);
      setHasAnswered(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results if poll ended or student has answered
  if (pollResults || (hasAnswered && currentPoll && !currentPoll.isActive)) {
    return (
      <div className="student-interface">
        <div className="student-header">
          <h2>Welcome, {studentName}!</h2>
          <div className="student-badge">Student</div>
        </div>
        <PollResults 
          poll={currentPoll} 
          results={pollResults} 
          showWaitMessage={!pollResults}
        />
      </div>
    );
  }

  // Show waiting state if no active poll
  if (!currentPoll || !currentPoll.isActive) {
    return (
      <div className="student-interface">
        <div className="student-header">
          <h2>Welcome, {studentName}!</h2>
          <div className="student-badge">Student</div>
        </div>
        <div className="waiting-container">
          <div className="waiting-content">
            <div className="loading-spinner"></div>
            <h3>Wait for the teacher to ask questions.</h3>
          </div>
        </div>
      </div>
    );
  }

  // Show poll question
  return (
    <div className="student-interface">
      <div className="student-header">
        <h2>Welcome, {studentName}!</h2>
        <div className="student-badge">Student</div>
      </div>
      
      <div className="poll-container">
        <div className="poll-header">
          <h3>Question</h3>
          <div className="timer">
            <span className="timer-icon">⏱</span>
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="question-card">
          <h2>{currentPoll.question}</h2>
          
          <div className="options-list">
            {currentPoll.options.map((option, index) => (
              <div 
                key={index}
                className={`option-item ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => !hasAnswered && setSelectedOption(index)}
              >
                <div className="option-radio">
                  <input 
                    type="radio" 
                    name="poll-option" 
                    checked={selectedOption === index}
                    onChange={() => {}}
                    disabled={hasAnswered}
                  />
                </div>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
          
          <button 
            className={`btn btn-primary submit-btn ${selectedOption === null || hasAnswered ? 'disabled' : ''}`}
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || hasAnswered}
          >
            {hasAnswered ? 'Answer Submitted' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentInterface;
