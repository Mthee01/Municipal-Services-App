import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertIssueSchema, insertPaymentSchema, insertUserSchema, 
  insertFieldReportSchema, insertPartsInventorySchema, insertPartsOrderSchema,
  insertTechnicianMessageSchema, insertTechnicianLocationSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Issues endpoints
  app.get("/api/issues", async (req, res) => {
    try {
      const { status, category, ward } = req.query;
      let issues;

      if (status) {
        issues = await storage.getIssuesByStatus(status as string);
      } else if (category) {
        issues = await storage.getIssuesByCategory(category as string);
      } else if (ward) {
        issues = await storage.getIssuesByWard(ward as string);
      } else {
        issues = await storage.getIssues();
      }

      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });

  app.get("/api/issues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getIssue(id);
      
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch issue" });
    }
  });

  app.post("/api/issues", upload.array('photos', 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const photos = files ? files.map(file => `/uploads/${file.filename}`) : [];
      
      const issueData = {
        ...req.body,
        photos
      };

      const validatedData = insertIssueSchema.parse(issueData);
      const issue = await storage.createIssue(validatedData);
      
      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create issue" });
      }
    }
  });

  app.patch("/api/issues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const issue = await storage.updateIssue(id, updates);
      
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: "Failed to update issue" });
    }
  });

  // Payments endpoints
  app.get("/api/payments", async (req, res) => {
    try {
      const { type } = req.query;
      let payments;

      if (type) {
        payments = await storage.getPaymentsByType(type as string);
      } else {
        payments = await storage.getPayments();
      }

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create payment" });
      }
    }
  });

  // Teams endpoints
  app.get("/api/teams", async (req, res) => {
    try {
      const { department } = req.query;
      let teams;

      if (department) {
        teams = await storage.getTeamsByDepartment(department as string);
      } else {
        teams = await storage.getTeams();
      }

      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const team = await storage.updateTeam(id, updates);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  // Statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const allIssues = await storage.getIssues();
      const openIssues = allIssues.filter(issue => issue.status === "open").length;
      const inProgress = allIssues.filter(issue => issue.status === "in_progress").length;
      const resolvedToday = allIssues.filter(issue => {
        if (!issue.resolvedAt) return false;
        const today = new Date();
        const resolvedDate = new Date(issue.resolvedAt);
        return resolvedDate.toDateString() === today.toDateString();
      }).length;

      // Calculate average resolution time
      const resolvedIssues = allIssues.filter(issue => issue.resolvedAt);
      const avgResolutionTime = resolvedIssues.length > 0 
        ? resolvedIssues.reduce((acc, issue) => {
            const created = new Date(issue.createdAt).getTime();
            const resolved = new Date(issue.resolvedAt!).getTime();
            return acc + (resolved - created);
          }, 0) / resolvedIssues.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      res.json({
        openIssues,
        inProgress,
        resolvedToday,
        avgResolution: Math.round(avgResolutionTime * 10) / 10
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Technicians endpoints
  app.get("/api/technicians", async (req, res) => {
    try {
      const { department, status } = req.query;
      let technicians;

      if (department) {
        technicians = await storage.getTechniciansByDepartment(department as string);
      } else if (status) {
        technicians = await storage.getTechniciansByStatus(status as string);
      } else {
        technicians = await storage.getTechnicians();
      }

      res.json(technicians);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch technicians" });
    }
  });

  app.post("/api/technicians/:technicianId/assign/:issueId", async (req, res) => {
    try {
      const technicianId = parseInt(req.params.technicianId);
      const issueId = parseInt(req.params.issueId);
      
      const success = await storage.assignTechnicianToIssue(technicianId, issueId);
      
      if (!success) {
        return res.status(404).json({ message: "Technician or issue not found" });
      }
      
      res.json({ message: "Technician assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign technician" });
    }
  });

  app.patch("/api/technicians/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const technician = await storage.updateTechnician(id, updates);
      
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      res.json(technician);
    } catch (error) {
      res.status(500).json({ message: "Failed to update technician" });
    }
  });

  // Wards endpoints
  app.get("/api/wards", async (req, res) => {
    try {
      const wards = await storage.getWards();
      res.json(wards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wards" });
    }
  });

  app.get("/api/wards/:wardNumber/stats", async (req, res) => {
    try {
      const wardNumber = req.params.wardNumber;
      const stats = await storage.getWardStats(wardNumber);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ward statistics" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/municipality", async (req, res) => {
    try {
      const stats = await storage.getMunicipalityStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch municipality analytics" });
    }
  });

  app.get("/api/analytics/technicians", async (req, res) => {
    try {
      const performance = await storage.getTechnicianPerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch technician performance" });
    }
  });

  app.get("/api/analytics/departments", async (req, res) => {
    try {
      const { department } = req.query;
      const stats = await storage.getDepartmentStats(department as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department analytics" });
    }
  });

  // Distance calculation utility endpoint
  app.post("/api/technicians/nearest", async (req, res) => {
    try {
      const { latitude, longitude, department } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude required" });
      }

      let technicians = await storage.getTechniciansByStatus("available");
      
      if (department) {
        technicians = technicians.filter(tech => tech.department === department);
      }

      // Calculate distances and sort by nearest
      const techniciansWithDistance = technicians
        .filter(tech => tech.latitude && tech.longitude)
        .map(tech => {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(tech.latitude!),
            parseFloat(tech.longitude!)
          );
          return { ...tech, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      res.json(techniciansWithDistance);
    } catch (error) {
      res.status(500).json({ message: "Failed to find nearest technicians" });
    }
  });

  // Voucher endpoints
  app.get("/api/vouchers", async (req, res) => {
    try {
      const { type } = req.query;
      let vouchers;
      
      if (type) {
        vouchers = await storage.getVouchersByType(type as string);
      } else {
        vouchers = await storage.getVouchers();
      }
      
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });

  app.post("/api/vouchers", async (req, res) => {
    try {
      const { type, amount } = req.body;
      
      if (!type || !amount) {
        return res.status(400).json({ message: "Type and amount are required" });
      }

      // Generate unique voucher code
      const voucherCode = `${type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      // Set expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const voucher = await storage.createVoucher({
        type,
        amount: Math.round(amount * 100), // Convert to cents
        voucherCode,
        status: 'active',
        expiryDate,
      });

      res.json(voucher);
    } catch (error) {
      res.status(500).json({ message: "Failed to create voucher" });
    }
  });

  app.post("/api/vouchers/use", async (req, res) => {
    try {
      const { voucherCode } = req.body;
      
      if (!voucherCode) {
        return res.status(400).json({ message: "Voucher code is required" });
      }

      const success = await storage.useVoucher(voucherCode);
      
      if (success) {
        res.json({ message: "Voucher used successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired voucher code" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to use voucher" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, rememberMe } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        success: true,
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          municipalityAccountNo: user.municipalityAccountNo,
          role: user.role 
        },
        rememberMe: rememberMe || false
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input data", details: result.error.issues });
      }

      const { username, password, name, email, phone, role, municipalityAccountNo } = result.data;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const newUser = await storage.createUser({
        username,
        password, // In production, hash this password
        name,
        email: email || null,
        phone: phone || null,
        role: role || "citizen",
        municipalityAccountNo: municipalityAccountNo || null
      });

      res.json({ 
        success: true, 
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          role: newUser.role,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          municipalityAccountNo: newUser.municipalityAccountNo
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Field Report endpoints
  app.get("/api/field-reports", async (req, res) => {
    try {
      const { technicianId, issueId } = req.query;
      let reports;
      
      if (technicianId) {
        reports = await storage.getFieldReportsByTechnician(Number(technicianId));
      } else if (issueId) {
        reports = await storage.getFieldReportsByIssue(Number(issueId));
      } else {
        reports = await storage.getFieldReports();
      }
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch field reports" });
    }
  });

  app.post("/api/field-reports", upload.array('photos', 5), async (req, res) => {
    try {
      const reportData = insertFieldReportSchema.parse(req.body);
      
      // Handle uploaded photos
      if (req.files && Array.isArray(req.files)) {
        reportData.photos = req.files.map(file => `/uploads/${file.filename}`);
      }
      
      const report = await storage.createFieldReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid field report data" });
    }
  });

  app.patch("/api/field-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const report = await storage.updateFieldReport(id, updates);
      
      if (!report) {
        return res.status(404).json({ error: "Field report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: "Failed to update field report" });
    }
  });

  // Parts Inventory endpoints
  app.get("/api/parts-inventory", async (req, res) => {
    try {
      const { category } = req.query;
      let inventory;
      
      if (category) {
        inventory = await storage.getPartsInventoryByCategory(category as string);
      } else {
        inventory = await storage.getPartsInventory();
      }
      
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parts inventory" });
    }
  });

  app.post("/api/parts-inventory", async (req, res) => {
    try {
      const itemData = insertPartsInventorySchema.parse(req.body);
      const item = await storage.createPartsInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory item data" });
    }
  });

  app.patch("/api/parts-inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updatePartsInventoryItem(id, updates);
      
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update inventory item" });
    }
  });

  // Parts Order endpoints
  app.get("/api/parts-orders", async (req, res) => {
    try {
      const { technicianId, status } = req.query;
      let orders;
      
      if (technicianId) {
        orders = await storage.getPartsOrdersByTechnician(Number(technicianId));
      } else if (status) {
        orders = await storage.getPartsOrdersByStatus(status as string);
      } else {
        orders = await storage.getPartsOrders();
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parts orders" });
    }
  });

  app.post("/api/parts-orders", async (req, res) => {
    try {
      const orderData = insertPartsOrderSchema.parse(req.body);
      const order = await storage.createPartsOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid parts order data" });
    }
  });

  app.patch("/api/parts-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const order = await storage.updatePartsOrder(id, updates);
      
      if (!order) {
        return res.status(404).json({ error: "Parts order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to update parts order" });
    }
  });

  // Technician Message endpoints
  app.get("/api/technician-messages", async (req, res) => {
    try {
      const { userId, fromUserId, toUserId } = req.query;
      let messages;
      
      if (fromUserId && toUserId) {
        messages = await storage.getTechnicianMessagesBetweenUsers(Number(fromUserId), Number(toUserId));
      } else if (userId) {
        messages = await storage.getTechnicianMessagesByUser(Number(userId));
      } else {
        messages = await storage.getTechnicianMessages();
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch technician messages" });
    }
  });

  app.post("/api/technician-messages", async (req, res) => {
    try {
      const messageData = insertTechnicianMessageSchema.parse(req.body);
      const message = await storage.createTechnicianMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.patch("/api/technician-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const message = await storage.updateTechnicianMessage(id, updates);
      
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Failed to update message" });
    }
  });

  // Technician Location endpoints
  app.get("/api/technician-locations", async (req, res) => {
    try {
      const { technicianId, latest } = req.query;
      let locations;
      
      if (technicianId && latest === 'true') {
        const location = await storage.getLatestTechnicianLocation(Number(technicianId));
        return res.json(location || null);
      } else if (technicianId) {
        locations = await storage.getTechnicianLocationsByTechnician(Number(technicianId));
      } else {
        locations = await storage.getTechnicianLocations();
      }
      
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch technician locations" });
    }
  });

  app.post("/api/technician-locations", async (req, res) => {
    try {
      const locationData = insertTechnicianLocationSchema.parse(req.body);
      const location = await storage.createTechnicianLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  // Work session endpoints for field technicians
  app.post("/api/work-sessions/start", async (req, res) => {
    try {
      const { issueId, technicianId } = req.body;
      
      // Update issue status to in_progress and assign technician
      const issue = await storage.updateIssue(issueId, {
        status: 'in_progress',
        technicianId: technicianId
      });
      
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      
      // Create location entry for work start
      await storage.createTechnicianLocation({
        technicianId,
        latitude: req.body.latitude || '0',
        longitude: req.body.longitude || '0',
        address: req.body.address || 'On site'
      });
      
      res.json({ message: "Work session started", issue });
    } catch (error) {
      res.status(400).json({ error: "Failed to start work session" });
    }
  });

  app.post("/api/work-sessions/complete", async (req, res) => {
    try {
      const { issueId, technicianId, completionNotes } = req.body;
      
      // Update issue status to resolved
      const issue = await storage.updateIssue(issueId, {
        status: 'resolved',
        resolvedAt: new Date(),
        feedback: completionNotes
      });
      
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      
      // Create completion field report
      await storage.createFieldReport({
        issueId,
        technicianId,
        reportType: 'completion',
        description: completionNotes || 'Work completed',
        findings: 'Issue resolved successfully',
        actionsTaken: 'Completed assigned work',
        materialsUsed: [],
        nextSteps: 'No further action required'
      });
      
      res.json({ message: "Work session completed", issue });
    } catch (error) {
      res.status(400).json({ error: "Failed to complete work session" });
    }
  });

  const httpServer = createServer(app);
  
  // Add WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    // Send welcome message
    ws.send(JSON.stringify({
      id: Date.now().toString(),
      type: 'info',
      title: 'Connected',
      message: 'Real-time notifications enabled',
      timestamp: new Date(),
      read: false
    }));
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
  
  // Broadcast notification to all connected clients
  const broadcastNotification = (notification: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  };
  
  // Add notification broadcasting to issue updates
  const originalCreateIssue = storage.createIssue.bind(storage);
  storage.createIssue = async (issue) => {
    const newIssue = await originalCreateIssue(issue);
    broadcastNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'New Issue Reported',
      message: `${newIssue.title} reported in ${newIssue.location}`,
      timestamp: new Date(),
      read: false,
      issueId: newIssue.id,
      location: newIssue.ward
    });
    return newIssue;
  };
  
  const originalUpdateIssue = storage.updateIssue.bind(storage);
  storage.updateIssue = async (id, updates) => {
    const updatedIssue = await originalUpdateIssue(id, updates);
    if (updatedIssue) {
      const notificationType = updatedIssue.status === 'resolved' ? 'success' : 
                              updatedIssue.status === 'in_progress' ? 'warning' : 'info';
      broadcastNotification({
        id: Date.now().toString(),
        type: notificationType,
        title: 'Issue Updated',
        message: `${updatedIssue.title} status changed to ${updatedIssue.status}`,
        timestamp: new Date(),
        read: false,
        issueId: updatedIssue.id,
        location: updatedIssue.ward
      });
    }
    return updatedIssue;
  };

  return httpServer;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}
