const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const {
  users,
  lessons,
  notifications,
  createDemoData,
  findUserById,
  findLessonById
} = require('./data');

const app = express();
const PORT = process.env.PORT || 4000;

// Seed demo data
createDemoData();

// Middleware
app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Serve static front-end
app.use(express.static(path.join(__dirname, '..', 'public')));

function toPublicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

function createTokenForUser(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  ).toString('base64');

  return `${header}.${payload}.`; // simple unsigned JWT-like token
}

function parseUserFromToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) {
      console.error('Token parse error: Invalid format, parts.length =', parts.length);
      return null;
    }
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);
    const user = users.find((u) => u._id === payload.id);
    if (!user) {
      console.error('Token parse error: User not found for id', payload.id);
      console.error('Available user IDs:', users.map(u => u._id));
    }
    return user || null;
  } catch (err) {
    console.error('Token parse error:', err.message);
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);
  const user = parseUserFromToken(token);

  if (!user) {
    return res.status(401).json({ message: 'Invalid auth token' });
  }

  req.user = user;
  return next();
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

// Auth routes
function loginHandler(req, res) {
  const { email, password, userType } = req.body || {};

  if (!email || !password || !userType) {
    return res
      .status(400)
      .json({ message: 'email, password and userType are required in the request body' });
  }

  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === userType
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Account is inactive' });
  }

  const token = createTokenForUser(user);

  return res.json({
    token,
    user: toPublicUser(user)
  });
}

app.post('/api/login', loginHandler);
app.post('/api/auth/login', loginHandler);

app.get('/api/profile', authMiddleware, (req, res) => {
  res.json(toPublicUser(req.user));
});

// Admin stats
function adminStatsHandler(req, res) {
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalInstructors = users.filter((u) => u.role === 'instructor').length;

  const today = new Date().toISOString().slice(0, 10);
  const todaysLessons = lessons.filter(
    (l) => (l.date || '').slice(0, 10) === today && l.status !== 'cancelled'
  ).length;

  const pendingActions = lessons.filter((l) => l.status === 'scheduled').length;

  res.json({
    totalStudents,
    totalInstructors,
    todaysLessons,
    pendingActions
  });
}

app.get('/api/admin/stats', authMiddleware, requireRole('admin'), adminStatsHandler);
app.get('/api/dashboard/stats', authMiddleware, requireRole('admin'), adminStatsHandler);

// Users CRUD (admin only)
app.get('/api/users', authMiddleware, requireRole('admin'), (req, res) => {
  const { role } = req.query;

  let result = users.filter((u) => u.role !== 'admin');
  if (role) {
    result = result.filter((u) => u.role === role);
  }

  res.json(result.map(toPublicUser));
});

app.post('/api/users', authMiddleware, requireRole('admin'), (req, res) => {
  const { name, email, role, password, isActive = true } = req.body || {};

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'name, email and role are required' });
  }

  if (!['student', 'instructor'].includes(role)) {
    return res.status(400).json({ message: 'role must be student or instructor' });
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const newUser = {
    _id: uuidv4(),
    name,
    email,
    password: password || 'password123',
    role,
    isActive: Boolean(isActive)
  };

  users.push(newUser);

  return res.status(201).json(toPublicUser(newUser));
});

app.put('/api/users/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const user = findUserById(id);

  if (!user || user.role === 'admin') {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, email, role, isActive } = req.body || {};

  if (email && email !== user.email) {
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u._id !== id)) {
      return res.status(409).json({ message: 'Email already in use' });
    }
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined && role !== 'admin') user.role = role;
  if (isActive !== undefined) user.isActive = Boolean(isActive);

  return res.json(toPublicUser(user));
});

app.delete('/api/users/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const index = users.findIndex((u) => u._id === id && u.role !== 'admin');

  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Also remove related lessons
  for (let i = lessons.length - 1; i >= 0; i -= 1) {
    if (lessons[i].studentId === id || lessons[i].instructorId === id) {
      lessons.splice(i, 1);
    }
  }

  users.splice(index, 1);

  return res.status(204).end();
});

function serializeLesson(lesson) {
  const student = findUserById(lesson.studentId);
  const instructor = findUserById(lesson.instructorId);

  return {
    ...lesson,
    studentId: student ? toPublicUser(student) : null,
    instructorId: instructor ? toPublicUser(instructor) : null
  };
}

// Lessons
app.get('/api/lessons', authMiddleware, (req, res) => {
  const { user } = req;
  let result = lessons;

  if (user.role === 'student') {
    result = lessons.filter((l) => l.studentId === user._id);
  } else if (user.role === 'instructor') {
    result = lessons.filter((l) => l.instructorId === user._id);
  }

  res.json(result.map(serializeLesson));
});

app.post('/api/lessons', authMiddleware, requireAnyRole(['admin', 'instructor']), (req, res) => {
  const { studentId, instructorId, date, time, type } = req.body || {};

  if (!studentId || !instructorId || !date || !time || !type) {
    return res
      .status(400)
      .json({ message: 'studentId, instructorId, date, time and type are required' });
  }

  if (!findUserById(studentId) || !findUserById(instructorId)) {
    return res.status(400).json({ message: 'Invalid studentId or instructorId' });
  }

  const lesson = {
    _id: uuidv4(),
    studentId,
    instructorId,
    date,
    time,
    type,
    status: 'scheduled'
  };

  lessons.push(lesson);

  return res.status(201).json(serializeLesson(lesson));
});

// Messages / notifications
app.post(
  '/api/messages',
  authMiddleware,
  requireAnyRole(['admin', 'instructor', 'student']),
  (req, res) => {
    const { toRole = 'admin', subject, body } = req.body || {};

    if (!subject || !body) {
      return res.status(400).json({ message: 'subject and body are required' });
    }

    const message = {
      _id: uuidv4(),
      from: toPublicUser(req.user),
      toRole,
      subject,
      body,
      createdAt: new Date().toISOString()
    };

    notifications.push(message);

    return res.status(201).json(message);
  }
);

// Students can book a lesson for themselves; the server assigns an instructor.
app.post('/api/lessons/book', authMiddleware, requireAnyRole(['student', 'admin', 'instructor']), (req, res) => {
  const { date, time, type } = req.body || {};

  if (!date || !time || !type) {
    return res.status(400).json({ message: 'date, time and type are required' });
  }

  // Student who is booking; if called by admin/instructor we still require a studentId in body.
  let { studentId } = req.body || {};
  if (!studentId && req.user.role === 'student') {
    studentId = req.user._id;
  }

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required when not booking as a student' });
  }

  const student = findUserById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(400).json({ message: 'Invalid studentId' });
  }

  // Pick the first active instructor as default
  let instructorId = (req.body && req.body.instructorId) || null;
  if (!instructorId) {
    const firstInstructor = users.find((u) => u.role === 'instructor' && u.isActive);
    if (!firstInstructor) {
      return res.status(400).json({ message: 'No available instructor to assign' });
    }
    instructorId = firstInstructor._id;
  }

  const instructor = findUserById(instructorId);
  if (!instructor || instructor.role !== 'instructor') {
    return res.status(400).json({ message: 'Invalid instructorId' });
  }

  const lesson = {
    _id: uuidv4(),
    studentId,
    instructorId,
    date,
    time,
    type,
    status: 'scheduled'
  };

  lessons.push(lesson);

  return res.status(201).json(serializeLesson(lesson));
});

app.put(
  '/api/lessons/:id',
  authMiddleware,
  requireAnyRole(['admin', 'instructor']),
  (req, res) => {
    const { id } = req.params;
    const lesson = findLessonById(id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const { date, time, type, status } = req.body || {};

    if (date !== undefined) lesson.date = date;
    if (time !== undefined) lesson.time = time;
    if (type !== undefined) lesson.type = type;
    if (status !== undefined) lesson.status = status;

    return res.json(serializeLesson(lesson));
  }
);

app.post(
  '/api/lessons/:id/attendance',
  authMiddleware,
  requireAnyRole(['admin', 'instructor']),
  (req, res) => {
    const { id } = req.params;
    const lesson = findLessonById(id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const { status = 'completed' } = req.body || {};
    lesson.status = status;

    return res.json(serializeLesson(lesson));
  }
);

app.delete(
  '/api/lessons/:id',
  authMiddleware,
  requireAnyRole(['admin', 'instructor', 'student']),
  (req, res) => {
    const { id } = req.params;
    const index = lessons.findIndex((l) => l._id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Students can only delete their own lessons
    if (req.user.role === 'student' && lessons[index].studentId !== req.user._id) {
      return res.status(403).json({ message: 'You can only cancel your own lessons' });
    }

    lessons.splice(index, 1);

    return res.status(204).end();
  }
);

// Messages / Notifications
app.post('/api/messages', authMiddleware, requireAnyRole(['admin', 'instructor', 'student']), (req, res) => {
  const { toRole = 'admin', subject, body } = req.body || {};

  if (!subject || !body) {
    return res.status(400).json({ message: 'subject and body are required' });
  }

  const { notifications } = require('./data');
  const notification = {
    _id: uuidv4(),
    fromUserId: req.user._id,
    fromUserName: req.user.name,
    fromRole: req.user.role,
    toRole,
    subject,
    body,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);

  return res.status(201).json(notification);
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  const { notifications } = require('./data');
  
  // Admin sees all notifications
  if (req.user.role === 'admin') {
    return res.json(notifications);
  }
  
  // Students and instructors see announcements directed to them or all users
  const filtered = notifications.filter((n) => {
    return n.toRole === 'all' || n.toRole === req.user.role;
  });
  
  res.json(filtered);
});

// Health check (JSON)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DrivePro backend is running' });
});

// 404 handler (for API routes only)
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Basic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log the error for debugging
  // In a real app, we might use a logging service
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`DrivePro backend listening on port ${PORT}`);
});


