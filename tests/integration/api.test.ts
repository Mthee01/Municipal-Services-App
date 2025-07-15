import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../../server/routes'
import type { Server } from 'http'

describe('API Integration Tests', () => {
  let app: express.Express
  let server: Server

  beforeAll(async () => {
    app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    
    server = await registerRoutes(app)
  })

  afterAll(async () => {
    if (server) {
      server.close()
    }
  })

  describe('Authentication API', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'citizen',
          password: 'password'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('user')
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid',
          password: 'wrong'
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('message', 'Invalid credentials')
    })

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })
  })

  describe('Issues API', () => {
    let authCookie: string

    beforeAll(async () => {
      // Login to get authentication cookie
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'citizen',
          password: 'password'
        })
      
      authCookie = loginResponse.headers['set-cookie'][0]
    })

    it('should fetch all issues', async () => {
      const response = await request(app)
        .get('/api/issues')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should create a new issue', async () => {
      const newIssue = {
        title: 'Test Water Leak',
        description: 'Water leak in front of building',
        category: 'water_sanitation',
        priority: 'medium',
        location: '123 Test Street, Cape Town',
        ward: 'Ward 1',
        reporterName: 'Test User',
        reporterPhone: '0821234567'
      }

      const response = await request(app)
        .post('/api/issues')
        .set('Cookie', authCookie)
        .send(newIssue)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('referenceNumber')
      expect(response.body.title).toBe('Test Water Leak')
    })

    it('should get issue by ID', async () => {
      const response = await request(app)
        .get('/api/issues/1')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id', 1)
    })

    it('should update issue status', async () => {
      const updates = {
        status: 'assigned',
        assignedTo: 'technician1'
      }

      const response = await request(app)
        .patch('/api/issues/1')
        .set('Cookie', authCookie)
        .send(updates)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('assigned')
    })

    it('should rate an issue', async () => {
      const rating = {
        rating: 5,
        feedback: 'Excellent service!'
      }

      const response = await request(app)
        .post('/api/issues/1/rate')
        .set('Cookie', authCookie)
        .send(rating)

      expect(response.status).toBe(200)
      expect(response.body.rating).toBe(5)
    })

    it('should filter issues by status', async () => {
      const response = await request(app)
        .get('/api/issues?status=open')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should filter issues by category', async () => {
      const response = await request(app)
        .get('/api/issues?category=water_sanitation')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should filter issues by ward', async () => {
      const response = await request(app)
        .get('/api/issues?ward=Ward 1')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('Issue Notes API', () => {
    let authCookie: string

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'agent',
          password: 'password'
        })
      
      authCookie = loginResponse.headers['set-cookie'][0]
    })

    it('should add note to issue', async () => {
      const note = {
        note: 'Called citizen for more details',
        noteType: 'follow_up',
        createdBy: 'agent',
        createdByRole: 'call_centre_agent'
      }

      const response = await request(app)
        .post('/api/issues/1/notes')
        .set('Cookie', authCookie)
        .send(note)

      expect(response.status).toBe(201)
      expect(response.body.note).toBe('Called citizen for more details')
    })

    it('should get issue notes', async () => {
      const response = await request(app)
        .get('/api/issues/1/notes')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should escalate issue', async () => {
      const escalation = {
        escalationReason: 'Urgent repair needed',
        escalatedBy: 'agent',
        escalatedByRole: 'call_centre_agent'
      }

      const response = await request(app)
        .post('/api/issues/1/escalate')
        .set('Cookie', authCookie)
        .send(escalation)

      expect(response.status).toBe(201)
      expect(response.body.escalationReason).toBe('Urgent repair needed')
    })

    it('should get issue escalations', async () => {
      const response = await request(app)
        .get('/api/issues/1/escalations')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('Technicians API', () => {
    let authCookie: string

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'techmanager',
          password: 'password'
        })
      
      authCookie = loginResponse.headers['set-cookie'][0]
    })

    it('should fetch all technicians', async () => {
      const response = await request(app)
        .get('/api/technicians')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should create new technician', async () => {
      const newTechnician = {
        name: 'New Technician',
        phone: '0821234567',
        email: 'new@municipality.gov.za',
        department: 'Electricity',
        skills: ['Electrical work', 'Meter reading'],
        status: 'available'
      }

      const response = await request(app)
        .post('/api/technicians')
        .set('Cookie', authCookie)
        .send(newTechnician)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe('New Technician')
    })

    it('should find nearest technicians', async () => {
      const location = {
        latitude: -33.9249,
        longitude: 18.4241
      }

      const response = await request(app)
        .post('/api/technicians/nearest')
        .set('Cookie', authCookie)
        .send(location)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should assign technician to issue', async () => {
      const response = await request(app)
        .post('/api/technicians/1/assign/1')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })

    it('should update technician status', async () => {
      const updates = {
        status: 'on_job',
        currentLocation: 'Field location'
      }

      const response = await request(app)
        .patch('/api/technicians/1')
        .set('Cookie', authCookie)
        .send(updates)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('on_job')
    })
  })

  describe('Statistics API', () => {
    let authCookie: string

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'mayor',
          password: 'password'
        })
      
      authCookie = loginResponse.headers['set-cookie'][0]
    })

    it('should get municipality statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('totalIssues')
      expect(response.body).toHaveProperty('resolvedIssues')
      expect(response.body).toHaveProperty('pendingIssues')
    })

    it('should get department statistics', async () => {
      const response = await request(app)
        .get('/api/stats?department=Water & Sanitation')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('totalTechnicians')
    })
  })

  describe('Payments API', () => {
    let authCookie: string

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'citizen',
          password: 'password'
        })
      
      authCookie = loginResponse.headers['set-cookie'][0]
    })

    it('should fetch payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should create payment', async () => {
      const payment = {
        type: 'water',
        amount: 15000,
        dueDate: '2024-01-31',
        accountNumber: 'ACC123456',
        description: 'Monthly water bill'
      }

      const response = await request(app)
        .post('/api/payments')
        .set('Cookie', authCookie)
        .send(payment)

      expect(response.status).toBe(201)
      expect(response.body.type).toBe('water')
      expect(response.body.amount).toBe(15000)
    })

    it('should filter payments by type', async () => {
      const response = await request(app)
        .get('/api/payments?type=water')
        .set('Cookie', authCookie)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')

      expect(response.status).toBe(404)
    })

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/issues')
        // No authentication cookie

      expect(response.status).toBe(401)
    })

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/issues')
        .send('invalid json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
    })

    it('should handle database errors gracefully', async () => {
      const response = await request(app)
        .get('/api/issues/99999')  // Non-existent ID

      expect(response.status).toBe(404)
    })
  })
})