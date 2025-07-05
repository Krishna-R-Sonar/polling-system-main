# Live Polling System

A real-time polling system built with React, Express.js, and Socket.IO that allows teachers to create polls and students to participate in real-time.

## Features

### Teacher Features
- Create new polls with multiple choice questions
- View live poll results with real-time updates
- Manage students (view participants, kick students)
- Configure poll timer (10-300 seconds)
- View poll history
- Real-time student answer tracking

### Student Features
- Join with unique name (stored in tab memory)
- Submit answers to active polls
- View live results after answering or timeout
- Real-time poll notifications
- Responsive mobile-friendly interface

### Technical Features
- Real-time communication with Socket.IO
- Responsive design matching Figma specifications
- In-memory data storage (easily extensible to database)
- Automatic poll timeout handling
- Live vote counting and percentage calculations

## Tech Stack

- **Frontend**: React 18, Socket.IO Client
- **Backend**: Express.js, Socket.IO
- **Styling**: Custom CSS with modern design
- **Real-time**: Socket.IO for bidirectional communication

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd polling
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Production Build

1. Build the React app:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The app will be available at http://localhost:5000

## Project Structure

```
polling/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # CSS styles
│   │   └── App.js          # Main app component
│   └── package.json
├── server/                 # Express backend
│   ├── server.js           # Main server file
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Usage

### For Teachers
1. Open the application
2. Select "I'm a Teacher"
3. Create polls with questions and multiple choice answers
4. Monitor student participation in real-time
5. View results as students submit answers
6. Manage students and view poll history

### For Students
1. Open the application
2. Select "I'm a Student"
3. Enter your name to join the session
4. Wait for teacher to create polls
5. Submit answers within the time limit
6. View live results after answering

## API Endpoints

- `GET /api/poll-history` - Retrieve poll history

## Socket.IO Events

### Client to Server
- `join-as-teacher` - Teacher joins session
- `join-as-student` - Student joins with name
- `create-poll` - Teacher creates new poll
- `submit-answer` - Student submits answer
- `kick-student` - Teacher kicks student

### Server to Client
- `poll-state` - Current poll and student state
- `new-poll` - New poll created
- `poll-ended` - Poll ended with results
- `student-joined` - New student joined
- `student-answered` - Student submitted answer
- `student-removed` - Student removed/kicked
- `kicked` - Student was kicked
- `error` - Error message

## Configuration

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

### Poll Settings
- Default timer: 60 seconds
- Timer range: 10-300 seconds
- Maximum options per poll: 6
- Minimum options per poll: 2

## Development

### Running Tests
```bash
cd client && npm test
```

### Code Structure
- Components are organized by functionality
- Socket.IO logic is centralized in custom hooks
- Styles follow BEM-like naming conventions
- Real-time state management through Socket.IO events

## Deployment

The application is designed to be easily deployable to platforms like:
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform

For production deployment:
1. Set environment variables
2. Build the React app
3. Start the Express server
4. Configure reverse proxy if needed

## Future Enhancements

- Database integration for persistent storage
- User authentication and sessions
- Chat functionality between teacher and students
- Advanced poll types (ranking, text input)
- Analytics and detailed reporting
- Multiple concurrent poll sessions
- Export poll results

## License

MIT License
