import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../../server/routes'
import type { Server } from 'http'

describe('Performance Tests', () => {
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

  describe('API Response Times', () => {
    it('should respond to /api/issues within 200ms', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/issues')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(200)
    })

    it('should respond to /api/technicians within 200ms', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/technicians')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(200)
    })

    it('should respond to /api/stats within 500ms', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/stats')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(500)
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      const concurrentRequests = 10
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app).get('/api/issues')
      )
      
      const start = Date.now()
      const responses = await Promise.all(promises)
      const totalTime = Date.now() - start
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      
      // Should handle 10 concurrent requests in under 1 second
      expect(totalTime).toBeLessThan(1000)
    })

    it('should handle concurrent issue creation', async () => {
      const concurrentCreations = 5
      const issueData = {
        title: 'Performance Test Issue',
        description: 'Testing concurrent issue creation',
        category: 'water_sanitation',
        location: 'Test Location',
        reporterName: 'Test User',
        reporterPhone: '0821234567'
      }
      
      const promises = Array.from({ length: concurrentCreations }, () =>
        request(app)
          .post('/api/issues')
          .send(issueData)
      )
      
      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('referenceNumber')
      })
    })
  })

  describe('Database Query Performance', () => {
    it('should efficiently filter issues by status', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/issues?status=open')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(100)
    })

    it('should efficiently search issues by reference number', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/issues?search=ABC123')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(50)
    })

    it('should efficiently load technician performance data', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/technicians/performance')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(300)
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory during repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/issues')
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be less than 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })

  describe('File Upload Performance', () => {
    it('should handle file uploads efficiently', async () => {
      const testFile = Buffer.from('test file content')
      
      const start = Date.now()
      
      const response = await request(app)
        .post('/api/issues')
        .attach('photos', testFile, 'test.jpg')
        .field('title', 'Test Issue with Photo')
        .field('description', 'Test description')
        .field('category', 'water_sanitation')
        .field('location', 'Test Location')
        .field('reporterName', 'Test User')
        .field('reporterPhone', '0821234567')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(201)
      expect(responseTime).toBeLessThan(500)
    })

    it('should handle multiple file uploads', async () => {
      const testFile1 = Buffer.from('test file 1')
      const testFile2 = Buffer.from('test file 2')
      
      const start = Date.now()
      
      const response = await request(app)
        .post('/api/issues')
        .attach('photos', testFile1, 'test1.jpg')
        .attach('photos', testFile2, 'test2.jpg')
        .field('title', 'Test Issue with Multiple Photos')
        .field('description', 'Test description')
        .field('category', 'water_sanitation')
        .field('location', 'Test Location')
        .field('reporterName', 'Test User')
        .field('reporterPhone', '0821234567')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(201)
      expect(responseTime).toBeLessThan(800)
    })
  })

  describe('WebSocket Performance', () => {
    it('should handle WebSocket connections efficiently', async () => {
      const WebSocket = require('ws')
      const wsUrl = 'ws://localhost:5000/ws'
      
      const connectPromises = Array.from({ length: 5 }, () => {
        return new Promise((resolve) => {
          const ws = new WebSocket(wsUrl)
          ws.on('open', () => {
            ws.close()
            resolve(true)
          })
        })
      })
      
      const start = Date.now()
      await Promise.all(connectPromises)
      const connectionTime = Date.now() - start
      
      expect(connectionTime).toBeLessThan(1000)
    })
  })

  describe('Pagination Performance', () => {
    it('should handle large datasets with pagination', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/issues?limit=50&offset=0')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(200)
      expect(response.body.length).toBeLessThanOrEqual(50)
    })

    it('should maintain performance with large offsets', async () => {
      const start = Date.now()
      
      const response = await request(app)
        .get('/api/issues?limit=10&offset=1000')
      
      const responseTime = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(300)
    })
  })

  describe('Cache Performance', () => {
    it('should cache frequently accessed data', async () => {
      // First request - should hit database
      const start1 = Date.now()
      const response1 = await request(app).get('/api/stats')
      const time1 = Date.now() - start1
      
      // Second request - should hit cache
      const start2 = Date.now()
      const response2 = await request(app).get('/api/stats')
      const time2 = Date.now() - start2
      
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(time2).toBeLessThan(time1) // Cached response should be faster
    })
  })

  describe('Database Connection Performance', () => {
    it('should handle connection pooling efficiently', async () => {
      const promises = Array.from({ length: 20 }, () =>
        request(app).get('/api/issues')
      )
      
      const start = Date.now()
      const responses = await Promise.all(promises)
      const totalTime = Date.now() - start
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      
      // 20 concurrent database queries should complete in under 2 seconds
      expect(totalTime).toBeLessThan(2000)
    })
  })

  describe('JSON Response Size', () => {
    it('should return appropriately sized responses', async () => {
      const response = await request(app)
        .get('/api/issues')
      
      const responseSize = JSON.stringify(response.body).length
      
      expect(response.status).toBe(200)
      // Response should be under 1MB
      expect(responseSize).toBeLessThan(1024 * 1024)
    })
  })
})