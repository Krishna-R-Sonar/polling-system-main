import React, { useState } from 'react';

const PollCreation = ({ onCreatePoll, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timer, setTimer] = useState(60);
  const [errors, setErrors] = useState({});

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    if (timer < 10 || timer > 300) {
      newErrors.timer = 'Timer must be between 10 and 300 seconds';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    
    onCreatePoll({
      question: question.trim(),
      options: validOptions,
      timer: timer
    });
  };

  return (
    <div className="poll-creation">
      <div className="poll-creation-header">
        <h3>Create New Poll</h3>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="poll-form">
        <div className="form-group">
          <label htmlFor="question">Poll Question</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question..."
            className={errors.question ? 'error' : ''}
            rows={3}
            maxLength={500}
          />
          {errors.question && <span className="error-message">{errors.question}</span>}
        </div>

        <div className="form-group">
          <label>Answer Options</label>
          <div className="options-container">
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => removeOption(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 6 && (
            <button
              type="button"
              className="btn btn-secondary add-option-btn"
              onClick={addOption}
            >
              + Add Option
            </button>
          )}
          
          {errors.options && <span className="error-message">{errors.options}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="timer">Poll Timer (seconds)</label>
          <input
            id="timer"
            type="number"
            value={timer}
            onChange={(e) => setTimer(parseInt(e.target.value) || 60)}
            min={10}
            max={300}
            className={errors.timer ? 'error' : ''}
          />
          <small className="form-help">Students will have {timer} seconds to answer</small>
          {errors.timer && <span className="error-message">{errors.timer}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Start Poll
          </button>
        </div>
      </form>
    </div>
  );
};

export default PollCreation;
