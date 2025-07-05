// polling-system-main/client/src/components/TeacherDashboard.js
import React, { useState, useEffect } from 'react';
import PollCreation from './PollCreation';
import PollResults from './PollResults';
import useSocket from '../hooks/useSocket';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const socket = useSocket();
  const [students, setStudents] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [currentPoll, setCurrentPoll] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.emit('join-as-teacher');

      socket.on('poll-state', (data) => {
        setCurrentPoll(data.currentPoll);
        setStudents(data.students || []);
      });

      socket.on('student-joined', (student) => {
        setStudents((prev) => [...prev, student]);
      });

      socket.on('student-answered', (data) => {
        setStudents((prev) =>
          prev.map((s) => (s.id === data.studentId ? { ...s, hasAnswered: true } : s))
        );
      });

      socket.on('student-removed', (data) => {
        setStudents((prev) => prev.filter((s) => s.id !== data.studentId));
      });

      socket.on('poll-ended', (data) => {
        setCurrentPoll(data.poll);
        fetchPollHistory();
      });

      return () => {
        socket.off('poll-state');
        socket.off('student-joined');
        socket.off('student-answered');
        socket.off('student-removed');
        socket.off('poll-ended');
      };
    }
  }, [socket]);

  const fetchPollHistory = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_API_URL 
        : 'http://localhost:5001';
      console.log('Fetching poll history from:', `${apiUrl}/api/poll-history`);
      const response = await fetch(`${apiUrl}/api/poll-history`);
      if指標

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPollHistory(data);
    } catch (error) {
      console.error('Failed to fetch poll history:', error);
    }
  };

  const kickStudent = (studentId) => {
    if (socket) {
      socket.emit('kick-student', { studentId });
    }
  };

  return (
    <div className="teacher-dashboard">
      <h2>Teacher Dashboard</h2>
      <PollCreation socket={socket} />
      <div className="students-list">
        <h3>Students</h3>
        {students.length === 0 ? (
          <p>No students yet.</p>
        ) : (
          <ul>
            {students.map((student) => (
              <li key={student.id}>
                {student.name} {student.hasAnswered ? '(Answered)' : ''}
                <button onClick={() => kickStudent(student.id)}>Kick</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <PollResults poll={currentPoll} />
      <button onClick={fetchPollHistory}>View Poll History</button>
      <div className="poll-history">
        <h3>Poll History</h3>
        {pollHistory.length === 0 ? (
          <p>No polls yet.</p>
        ) : (
          <ul>
            {pollHistory.map((poll) => (
              <li key={poll.id}>
                <h4>{poll.question}</h4>
                <ul>
                  {poll.results?.map((result, index) => (
                    <li key={index}>
                      {result.option}: {result.count} votes ({result.percentage}%)
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;