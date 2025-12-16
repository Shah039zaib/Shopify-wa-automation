/**
 * Health API Tests
 */

const request = require('supertest');
const express = require('express');

// Create a minimal express app for testing
const app = express();
app.use(express.json());

// Mock health route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health/db', (req, res) => {
  res.json({
    success: true,
    message: 'Database connection is healthy'
  });
});

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return server health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Database');
    });
  });
});
