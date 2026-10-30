import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Report } from '../src/models/Report.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('CivicActionAI REST API Integration Suite', () => {
  let createdComplaintId = '';
  let createdMongoId = '';

  it('GET /api/health should return 200 with service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.product).toBe('CivicActionAI');
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/reports should create a new complaint, execute AI analysis and return 201', async () => {
    const res = await request(app)
      .post('/api/reports')
      .field('description', 'Massive waterlogging on Ring Road near Metro station blocking all lanes.')
      .field('category', 'Waterlogging')
      .field('latitude', '12.9716')
      .field('longitude', '77.5946')
      .field('address', 'Ring Road Metro Station');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toMatch(/^CAI-\d+/);
    expect(res.body.data.category).toBe('Waterlogging');
    expect(res.body.data.priority).toBeDefined();
    expect(res.body.data.priorityReasons.length).toBeGreaterThan(0);
    expect(res.body.data.status).toBe('SUBMITTED');

    createdComplaintId = res.body.data.complaintId;
    createdMongoId = res.body.data._id;
  });

  it('POST /api/reports should reject invalid submission with missing coordinates', async () => {
    const res = await request(app)
      .post('/api/reports')
      .field('description', 'Test issue without location coordinates');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('coordinates');
  });

  it('GET /api/reports should return paginated complaints list', async () => {
    const res = await request(app).get('/api/reports?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  it('GET /api/reports/:id should retrieve complaint details', async () => {
    const res = await request(app).get(`/api/reports/${createdComplaintId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toBe(createdComplaintId);
    expect(res.body.data.statusHistory.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/reports/:id/assign should assign department and update status', async () => {
    const res = await request(app)
      .patch(`/api/reports/${createdComplaintId}/assign`)
      .send({
        department: 'Drainage',
        assignedTo: 'Officer Ramesh Kumar',
        note: 'Assigned for immediate dewatering.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assignedDepartment).toBe('Drainage');
    expect(res.body.data.assignedTo).toBe('Officer Ramesh Kumar');
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  it('PATCH /api/reports/:id/status should update workflow to IN PROGRESS then RESOLVED', async () => {
    // Transition to IN PROGRESS
    let res = await request(app)
      .patch(`/api/reports/${createdComplaintId}/status`)
      .send({
        status: 'IN PROGRESS',
        note: 'Pumping crew deployed on site.'
      });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN PROGRESS');

    // Transition to RESOLVED
    res = await request(app)
      .patch(`/api/reports/${createdComplaintId}/status`)
      .send({
        status: 'RESOLVED',
        note: 'Drain cleared and water completely drained.'
      });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('GET /api/reports/tracking/:complaintId should provide public citizen tracking info', async () => {
    const res = await request(app).get(`/api/reports/tracking/${createdComplaintId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toBe(createdComplaintId);
    expect(res.body.data.status).toBe('RESOLVED');
    expect(res.body.data.statusHistory.length).toBeGreaterThanOrEqual(3);
  });

  it('GET /api/dashboard/stats should return computed metrics', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReports).toBeGreaterThan(0);
    expect(res.body.data.statusDistribution).toBeDefined();
    expect(res.body.data.categoryDistribution).toBeDefined();
  });

  it('GET /api/dashboard/hotspots should return geospatial clusters', async () => {
    const res = await request(app).get('/api/dashboard/hotspots');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
