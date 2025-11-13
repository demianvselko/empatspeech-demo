db = db.getSiblingDB('speech_therapy');

const now = new Date();

const users = [
  {
    _id: '2f1e3c8e-9b2a-4c7a-8b3a-a2b7e0f1a101',
    role: 'Teacher',
    firstName: 'SLP1',
    lastName: 'Therapist',
    email: 'slp1@example.com',
    active: true,
    createdAt: now,
  },
  {
    _id: '5a7d2c4b-3f81-4b94-9a8d-bd9f7a2cbb02',
    role: 'Teacher',
    firstName: 'SLP2',
    lastName: 'Therapist',
    email: 'slp2@example.com',
    active: true,
    createdAt: now,
  },

  {
    _id: '8b3d1a2f-4c9b-4f1e-8a9b-b2c3d4e5f003',
    role: 'Student',
    firstName: 'AAAA',
    lastName: 'Student',
    email: 'aaaa.student@example.com',
    active: true,
    createdAt: now,
  },
  {
    _id: '9c4e2b3a-5d0c-4a1f-9b8c-c3d4e5f6a004',
    role: 'Student',
    firstName: 'BBBB',
    lastName: 'Student',
    email: 'bbbb.student@example.com',
    active: true,
    createdAt: now,
  },
  {
    _id: 'ad5f3c4b-6e1d-4b2a-8c9d-d4e5f6a7b005',
    role: 'Student',
    firstName: 'CCCC',
    lastName: 'Student',
    email: 'cccc.student@example.com',
    active: true,
    createdAt: now,
  },
  {
    _id: 'be6a4d5c-7f2e-4c3b-9dad-e5f6a7b8c006',
    role: 'Student',
    firstName: 'DDDD',
    lastName: 'Student',
    email: 'dddd.student@example.com',
    active: true,
    createdAt: now,
  },
  {
    _id: 'cf7b5e6d-802f-4d4c-aebe-f6a7b8c9d007',
    role: 'Student',
    firstName: 'ZZZZ',
    lastName: 'Student',
    email: 'zzzz.student@example.com',
    active: true,
    createdAt: now,
  },
];

db.users.insertMany(users, { ordered: true });
