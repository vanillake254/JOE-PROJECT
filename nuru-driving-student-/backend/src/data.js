const { v4: uuidv4 } = require('uuid');

// In-memory collections for demo purposes.
// For production use, replace this with a real database.
const users = [];
const lessons = [];
const notifications = [];

/**
 * Seed some demo users and lessons so the UI has data to work with.
 * Idempotent: safe to call multiple times.
 */
function createDemoData() {
  if (users.length > 0) return;

  const studentId = uuidv4();
  const instructorId = uuidv4();
  const adminId = uuidv4();

  users.push(
    {
      _id: studentId,
      name: 'Sarah Student',
      email: 'student@drivepro.com',
      password: 'password123',
      role: 'student',
      isActive: true
    },
    {
      _id: instructorId,
      name: 'Ivan Instructor',
      email: 'instructor@drivepro.com',
      password: 'password123',
      role: 'instructor',
      isActive: true
    },
    {
      _id: adminId,
      name: 'Alice Admin',
      email: 'admin@drivepro.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    }
  );

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  lessons.push(
    {
      _id: uuidv4(),
      type: 'Practical#1',
      date: today.toISOString(),
      time: '10:00',
      status: 'scheduled',
      studentId,
      instructorId
    },
    {
      _id: uuidv4(),
      type: 'Theory#1',
      date: tomorrow.toISOString(),
      time: '14:00',
      status: 'scheduled',
      studentId,
      instructorId
    }
  );
}

function findUserById(id) {
  return users.find((u) => u._id === id) || null;
}

function findLessonById(id) {
  return lessons.find((l) => l._id === id) || null;
}

module.exports = {
  users,
  lessons,
  notifications,
  createDemoData,
  findUserById,
  findLessonById
};


