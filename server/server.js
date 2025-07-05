const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: false
  }
});

// Middleware
app.use(cors({
  origin: "*",
  credentials: false
}));
app.use(express.json());

// Serve static files from React build (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// In-memory storage (in production, use a database)
let currentPoll = null;
let students = new Map(); // studentId -> { name, socketId, hasAnswered, answer }
let pollHistory = [];
let teacherSocketId = null;

// Poll timer
let pollTimer = null;
const POLL_TIMEOUT = 60000; // 60 seconds

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Teacher joins
  socket.on('join-as-teacher', () => {
    teacherSocketId = socket.id;
    socket.join('teachers');
    
    // Send current poll state
    socket.emit('poll-state', {
      currentPoll,
      students: Array.from(students.values()).map(s => ({
        id: s.id,
        name: s.name,
        hasAnswered: s.hasAnswered
      }))
    });
    
    console.log('Teacher joined:', socket.id);
  });

  // Student joins
  socket.on('join-as-student', (data) => {
    const { name } = data;
    const studentId = uuidv4();
    
    students.set(studentId, {
      id: studentId,
      name,
      socketId: socket.id,
      hasAnswered: false,
      answer: null
    });
    
    socket.join('students');
    socket.studentId = studentId;
    
    // Notify teacher of new student
    io.to('teachers').emit('student-joined', {
      id: studentId,
      name,
      hasAnswered: false
    });
    
    // Send current poll to student
    socket.emit('poll-state', { currentPoll });
    
    console.log('Student joined:', name, studentId);
  });

  // Teacher creates a poll
  socket.on('create-poll', (pollData) => {
    if (socket.id !== teacherSocketId) return;
    
    // Check if can create new poll
    const allStudentsAnswered = Array.from(students.values()).every(s => s.hasAnswered);
    if (currentPoll && !allStudentsAnswered) {
      socket.emit('error', { message: 'Cannot create poll while students are still answering' });
      return;
    }
    
    // Reset student answers
    students.forEach(student => {
      student.hasAnswered = false;
      student.answer = null;
    });
    
    currentPoll = {
      id: uuidv4(),
      question: pollData.question,
      options: pollData.options,
      createdAt: new Date(),
      isActive: true,
      timer: pollData.timer || 60
    };
    
    // Start poll timer
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = setTimeout(() => {
      endPoll();
    }, currentPoll.timer * 1000);
    
    // Broadcast poll to all users
    io.emit('new-poll', currentPoll);
    
    console.log('Poll created:', currentPoll.question);
  });

  // Student submits answer
  socket.on('submit-answer', (data) => {
    const { optionIndex } = data;
    const student = students.get(socket.studentId);
    
    if (!student || !currentPoll || !currentPoll.isActive || student.hasAnswered) {
      return;
    }
    
    student.hasAnswered = true;
    student.answer = optionIndex;
    
    // Notify teacher of answer
    io.to('teachers').emit('student-answered', {
      studentId: student.id,
      name: student.name
    });
    
    // Check if all students have answered
    const allAnswered = Array.from(students.values()).every(s => s.hasAnswered);
    if (allAnswered) {
      endPoll();
    }
    
    console.log('Student answered:', student.name, optionIndex);
  });

  // Teacher kicks student
  socket.on('kick-student', (data) => {
    if (socket.id !== teacherSocketId) return;
    
    const { studentId } = data;
    const student = students.get(studentId);
    
    if (student) {
      // Notify student they've been kicked
      io.to(student.socketId).emit('kicked');
      students.delete(studentId);
      
      // Notify teacher
      io.to('teachers').emit('student-removed', { studentId });
      
      console.log('Student kicked:', student.name);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.id === teacherSocketId) {
      teacherSocketId = null;
    }
    
    // Remove student if they disconnect
    if (socket.studentId) {
      const student = students.get(socket.studentId);
      if (student) {
        students.delete(socket.studentId);
        io.to('teachers').emit('student-removed', { studentId: socket.studentId });
      }
    }
  });
});

// Function to end current poll
function endPoll() {
  if (!currentPoll || !currentPoll.isActive) return;
  
  currentPoll.isActive = false;
  
  // Calculate results
  const results = currentPoll.options.map((option, index) => ({
    option,
    count: Array.from(students.values()).filter(s => s.answer === index).length
  }));
  
  const totalVotes = results.reduce((sum, r) => sum + r.count, 0);
  const resultsWithPercentage = results.map(r => ({
    ...r,
    percentage: totalVotes > 0 ? Math.round((r.count / totalVotes) * 100) : 0
  }));
  
  currentPoll.results = resultsWithPercentage;
  currentPoll.endedAt = new Date();
  
  // Add to history
  pollHistory.push({ ...currentPoll });
  
  // Clear timer
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  
  // Broadcast results
  io.emit('poll-ended', {
    poll: currentPoll,
    results: resultsWithPercentage
  });
  
  console.log('Poll ended:', currentPoll.question);
}

// API Routes
app.get('/api/poll-history', (req, res) => {
  res.json(pollHistory);
});

// Serve React app for all other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
