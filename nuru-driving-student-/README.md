# DrivePro - Student Management System

A full-stack driving school management system with role-based dashboards for Admins, Instructors, and Students.

## Features

### Admin Dashboard
- **User Management**: Create, edit, delete students and instructors
- **Schedule View**: See all lessons with dates, times, students, instructors, and status
- **Assignments View**: Instructor workload summary (total/upcoming/completed lessons)
- **Notifications**: View messages from instructors/students and send announcements

### Instructor Dashboard
- **My Students**: List of assigned students with lesson progress
- **Per-Student Actions**: Update progress (Lesson 1-10) and mark attendance
- **Quick Actions**: Bulk update/attendance for first lesson, send messages to admin
- **Today's Schedule**: Real-time view of current lessons

### Student Dashboard
- **Progress Tracking**: Completion percentage, lessons completed/remaining, hours driven
- **Upcoming Lessons**: View details and cancel lessons
- **Book Lesson**: Schedule new lessons (auto-assigned to available instructor)
- **Contact Support**: Send messages to admin

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript + Tailwind CSS + Font Awesome
- **Data**: In-memory (users, lessons, notifications) - easy to migrate to MongoDB/PostgreSQL
- **Auth**: JWT-like tokens (base64-encoded payloads)

## Setup & Run

### Prerequisites
- Node.js 14+ installed
- PowerShell (Windows) or Bash (Linux/Mac)

### Installation

1. **Navigate to backend directory**:
   ```powershell
   cd "C:\DEVELOPMENT\JOE PROJECT\nuru-driving-student-\backend"
   ```

2. **Install dependencies** (first time only):
   ```powershell
   npm install
   ```

3. **Start the server**:
   ```powershell
   npm start
   ```

   The server will start on **http://localhost:4000**

4. **Open the app in your browser**:
   - Navigate to `http://localhost:4000/`
   - The frontend is served directly by Express

### Demo Accounts

| Role         | Email                       | Password      |
|--------------|----------------------------|---------------|
| Admin        | admin@drivepro.com         | password123   |
| Instructor   | instructor@drivepro.com    | password123   |
| Student      | student@drivepro.com       | password123   |

## API Endpoints

### Authentication
- `POST /api/login` - Login with email, password, userType
- `POST /api/auth/login` - Alias for /api/login
- `GET /api/profile` - Get current user profile (requires auth)

### Admin Endpoints (Admin Only)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/admin/stats` - Alias for dashboard stats
- `GET /api/users` - List all users (students + instructors)
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/notifications` - List all messages/notifications

### Lesson Endpoints
- `GET /api/lessons` - List lessons (filtered by role: admin=all, instructor=their students, student=their lessons)
- `POST /api/lessons` - Create lesson (admin/instructor, requires studentId + instructorId)
- `POST /api/lessons/book` - Book lesson (student/admin/instructor, auto-assigns instructor for students)
- `PUT /api/lessons/:id` - Update lesson (admin/instructor)
- `POST /api/lessons/:id/attendance` - Mark attendance (admin/instructor)
- `DELETE /api/lessons/:id` - Cancel lesson (admin/instructor/student for their own)

### Messaging
- `POST /api/messages` - Send message (all roles can send to admin)
- `GET /api/notifications` - List all notifications (admin only)

## Project Structure

```
nuru-driving-student-/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express app, routes, middleware
│   │   └── data.js         # In-memory data (users, lessons, notifications)
│   ├── public/
│   │   └── index.html      # Full SPA with all dashboards
│   └── package.json
└── README.md
```

## Development

### Restart Server After Code Changes

**IMPORTANT**: After accepting code changes, you **must restart the backend** for them to take effect:

1. In PowerShell, stop the running server:
   - Press `Ctrl + C`

2. Start it again:
   ```powershell
   npm start
   ```

3. Hard-refresh the browser:
   - Press `Ctrl + Shift + R` or `Ctrl + F5`

### Debugging

- **Check server logs**: All requests and errors appear in the PowerShell terminal where you ran `npm start`
- **Check browser console**: Press `F12` → Console tab for frontend errors
- **Health check**: Visit `http://localhost:4000/health` to verify the server is running

### Common Issues

1. **"Route not found" errors**:
   - Server is running old code → Restart the backend (`Ctrl+C`, then `npm start`)

2. **"Attendance/Progress not working"**:
   - Ensure you're logged in as Instructor or Admin
   - Check browser console for exact error
   - Verify token is valid (logout and login again)

3. **"Messages not appearing in Admin Notifications"**:
   - Restart backend to load new `/api/messages` and `/api/notifications` routes
   - Send a new message after restart
   - Admin must click Notifications tab to see messages

## Future Enhancements

- Replace in-memory storage with MongoDB/PostgreSQL
- Add email notifications for lesson reminders
- Implement real-time updates with WebSockets
- Add file uploads for student documents
- Create mobile app with React Native
- Add payment integration for lesson fees

## License

MIT

## Author

Built for JOE PROJECT - Driving School Management System

