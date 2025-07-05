import React, { useState, useEffect } from 'react';
import useSocket from './hooks/useSocket';
import RoleSelection from './components/RoleSelection';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [students, setStudents] = useState([]);
  const [pollResults, setPollResults] = useState(null);
  const [isKicked, setIsKicked] = useState(false);
  
  const socket = useSocket();

  // Check initial connection state
  useEffect(() => {
    if (socket) {
      console.log('App: Socket instance available, connected:', socket.connected);
      setIsConnected(socket.connected);

      // Fallback: if socket exists but not marked as connected, set it after a delay
      const timeout = setTimeout(() => {
        if (socket && !isConnected) {
          console.log('App: Fallback - setting connected to true');
          setIsConnected(true);
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket) {
      console.log('App: No socket available');
      return;
    }

    console.log('App: Setting up socket listeners');

    // Connection events
    socket.on('connect', () => {
      console.log('App: Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('App: Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('App: Socket connection error:', error);
      setIsConnected(false);
    });

    // Poll events
    socket.on('poll-state', (data) => {
      setCurrentPoll(data.currentPoll);
      if (data.students) {
        setStudents(data.students);
      }
    });

    socket.on('new-poll', (poll) => {
      setCurrentPoll(poll);
      setPollResults(null);
    });

    socket.on('poll-ended', (data) => {
      setCurrentPoll(data.poll);
      setPollResults(data.results);
    });

    // Student events
    socket.on('student-joined', (student) => {
      setStudents(prev => [...prev, student]);
    });

    socket.on('student-answered', (data) => {
      setStudents(prev => 
        prev.map(s => 
          s.id === data.studentId 
            ? { ...s, hasAnswered: true }
            : s
        )
      );
    });

    socket.on('student-removed', (data) => {
      setStudents(prev => prev.filter(s => s.id !== data.studentId));
    });

    socket.on('kicked', () => {
      setIsKicked(true);
    });

    socket.on('error', (error) => {
      alert(error.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('poll-state');
      socket.off('new-poll');
      socket.off('poll-ended');
      socket.off('student-joined');
      socket.off('student-answered');
      socket.off('student-removed');
      socket.off('kicked');
      socket.off('error');
    };
  }, [socket]);

  const handleRoleSelect = (role) => {
    setUserRole(role);
    if (role === 'teacher') {
      socket.emit('join-as-teacher');
    }
  };

  const handleStudentJoin = (name) => {
    setStudentName(name);
    socket.emit('join-as-student', { name });
  };

  const handleCreatePoll = (pollData) => {
    socket.emit('create-poll', pollData);
  };

  const handleSubmitAnswer = (optionIndex) => {
    socket.emit('submit-answer', { optionIndex });
  };

  const handleKickStudent = (studentId) => {
    socket.emit('kick-student', { studentId });
  };

  if (isKicked) {
    return (
      <div className="app">
        <div className="kicked-container">
          <div className="kicked-card">
            <h2>You've been kicked out!</h2>
            <p>You have been removed from the polling session by the teacher.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Rejoin Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Temporarily bypass connection check for debugging
  if (!socket) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing socket connection...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="app">
        <RoleSelection onRoleSelect={handleRoleSelect} />
      </div>
    );
  }

  if (userRole === 'teacher') {
    return (
      <div className="app">
        <TeacherDashboard
          currentPoll={currentPoll}
          students={students}
          pollResults={pollResults}
          onCreatePoll={handleCreatePoll}
          onKickStudent={handleKickStudent}
        />
      </div>
    );
  }

  if (userRole === 'student') {
    return (
      <div className="app">
        <StudentInterface
          studentName={studentName}
          currentPoll={currentPoll}
          pollResults={pollResults}
          onJoin={handleStudentJoin}
          onSubmitAnswer={handleSubmitAnswer}
        />
      </div>
    );
  }

  return null;
}

export default App;
