const request = require('supertest');
const express = require('express');
const userRoutes = require('../../src/routes/users');

// Mock the User model
jest.mock('../../src/models/User', () => {
  const mockUser = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn(),
  }));
  mockUser.find = jest.fn();
  mockUser.findById = jest.fn();
  mockUser.findByIdAndUpdate = jest.fn();
  mockUser.findByIdAndDelete = jest.fn();
  return mockUser;
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const mockUsers = [{ name: 'User1' }, { name: 'User2' }];
      User.find.mockResolvedValue(mockUsers);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      User.find.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      const mockUser = { _id: '123', name: 'Test User' };
      User.findById.mockResolvedValue(mockUser);

      const response = await request(app).get('/api/users/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith('123');
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      const response = await request(app).get('/api/users/123');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 on error', async () => {
      User.findById.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/users/123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      bcrypt.hash.mockResolvedValue('hashedpass');
      const mockSavedUser = { name: 'New User', email: 'new@example.com', password: 'hashedpass', age: 25, _id: '456' };
      User.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockSavedUser),
      }));

      const response = await request(app)
        .post('/api/users')
        .send({ name: 'New User', email: 'new@example.com', password: 'password', age: 25 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockSavedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User).toHaveBeenCalledWith({ name: 'New User', email: 'new@example.com', password: 'hashedpass', age: 25 });
    });

    it('should return 400 on validation error', async () => {
      bcrypt.hash.mockResolvedValue('hashedpass');
      User.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockRejectedValue(new Error('Validation error')),
      }));

      const response = await request(app)
        .post('/api/users')
        .send({ name: 'New User', email: 'new@example.com', password: 'password', age: 25 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const mockUpdatedUser = { _id: '123', name: 'Updated User' };
      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/api/users/123')
        .send({ name: 'Updated User' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedUser);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', { name: 'Updated User' }, { new: true });
    });

    it('should return 404 if user not found', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/users/123')
        .send({ name: 'Updated User' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 on error', async () => {
      User.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .put('/api/users/123')
        .send({ name: 'Updated User' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const mockDeletedUser = { _id: '123', name: 'Deleted User' };
      User.findByIdAndDelete.mockResolvedValue(mockDeletedUser);

      const response = await request(app).delete('/api/users/123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    it('should return 404 if user not found', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app).delete('/api/users/123');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 on error', async () => {
      User.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/api/users/123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
});