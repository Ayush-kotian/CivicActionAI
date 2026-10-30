import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Report } from '../src/models/Report.js';
import { User } from '../src/models/User.js';
import { ensureDemoAdmin } from '../src/utils/initAdmin.js';

let adminToken = '';
let citizenToken = '';
let citizenUser = null;
let createdComplaintId = '';

beforeAll(async () => {
  await connectDB();
  await ensureDemoAdmin();

  // Obtain admin token
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rajesh@gmail.com', password: '123456' });
  adminToken = adminLoginRes.body.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('CivicActionAI Authentication & Authorization Suite', () => {
  it('should register a new citizen user with valid fields', async () => {
    // Unique email and username for test run
    const testSuffix = Date.now();
    const testEmail = `citizen_${testSuffix}@example.com`;
    const testUsername = `citizen_${testSuffix}`;
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Aarav Sharma',
        username: testUsername,
        phone: '9876500000',
        email: testEmail,
        password: 'secretpassword',
        confirmPassword: 'secretpassword'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('citizen');
    expect(res.body.user.name).toBe('Aarav Sharma');
    expect(res.body.user.username).toBe(testUsername);

    citizenToken = res.body.token;
    citizenUser = res.body.user;
  });

  it('should reject signup with password less than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Short Pass',
        username: `short_${Date.now()}`,
        phone: '9876500001',
        email: `short_${Date.now()}@example.com`,
        password: '123',
        confirmPassword: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('at least 6 characters');
  });

  it('should reject signup when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Mismatch',
        username: `mismatch_${Date.now()}`,
        phone: '9876500002',
        email: `mismatch_${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'password456'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('do not match');
  });

  it('should not allow direct registration with the predefined admin email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Fake Admin',
        username: `fake_admin_${Date.now()}`,
        phone: '9876500003',
        email: 'rajesh@gmail.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('reserved');
  });

  it('should sign in the predefined demo admin Rajesh (rajesh@gmail.com / 123456)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rajesh@gmail.com',
        password: '123456'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user.name).toBe('Rajesh');
    expect(res.body.token).toBeDefined();
  });

  it('should reject sign in with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rajesh@gmail.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('CivicActionAI REST API & Authorization Enforcement Suite', () => {
  let createdComplaintId = '';

  it('GET /api/health should return 200 with service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.product).toBe('CivicActionAI');
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/reports should allow complaint submission and attach citizen metadata if authenticated', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('description', 'Massive waterlogging on Ring Road near Metro station blocking all lanes.')
      .field('category', 'Waterlogging')
      .field('latitude', '12.9716')
      .field('longitude', '77.5946')
      .field('address', 'Ring Road Metro Station');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toMatch(/^CAI-\d+/);
    expect(res.body.data.category).toBe('Waterlogging');
    expect(res.body.data.citizenEmail).toBe(citizenUser.email);
    expect(res.body.data.citizenName).toBe(citizenUser.name);

    createdComplaintId = res.body.data.complaintId;
  });

  it('GET /api/reports/my-reports should allow citizen to view only their own complaints', async () => {
    const res = await request(app)
      .get('/api/reports/my-reports')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(r => r.complaintId === createdComplaintId)).toBe(true);
  });

  it('GET /api/reports should block normal citizen from accessing all admin reports (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('GET /api/reports should allow authorized admin to query all complaints', async () => {
    const res = await request(app)
      .get('/api/reports?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('PATCH /api/reports/:id/assign should block normal citizen (403)', async () => {
    const res = await request(app)
      .patch(`/api/reports/${createdComplaintId}/assign`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ department: 'Drainage', assignedTo: 'Illegal Change' });

    expect(res.status).toBe(403);
  });

  it('PATCH /api/reports/:id/assign should allow admin to assign department', async () => {
    const res = await request(app)
      .patch(`/api/reports/${createdComplaintId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        department: 'Drainage',
        assignedTo: 'Officer Ramesh Kumar',
        note: 'Assigned for immediate dewatering.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assignedDepartment).toBe('Drainage');
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  it('PATCH /api/reports/:id/status should allow admin to update status lifecycle', async () => {
    const res = await request(app)
      .patch(`/api/reports/${createdComplaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'RESOLVED',
        note: 'Drain cleared and water completely drained.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('GET /api/reports/tracking/:complaintId should allow public citizen tracking without login', async () => {
    const res = await request(app).get(`/api/reports/tracking/${createdComplaintId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toBe(createdComplaintId);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('POST /api/reports should detect duplicate and allow admin to review status', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('description', 'Severe waterlogging at Ring Road near metro station blocking traffic.')
      .field('category', 'Waterlogging')
      .field('latitude', '12.9717')
      .field('longitude', '77.5947')
      .field('address', 'Ring Road Metro');

    expect(res.status).toBe(201);
    const newComplaintId = res.body.data.complaintId;
    expect(res.body.data.duplicatePossible).toBe(true);

    // Authority review with admin token
    const confirmRes = await request(app)
      .patch(`/api/reports/${newComplaintId}/duplicate-status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed', note: 'Confirmed duplicate by supervisor.' });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.duplicateStatus).toBe('confirmed');
  });
});
