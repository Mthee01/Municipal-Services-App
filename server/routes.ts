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

  app.post("/api/technicians", async (req, res) => {
    try {
      const { name, phone, email, department, skills } = req.body;
      
      const newTechnician = await storage.createTechnician({
        name,
        phone,
        email: email || null,
        department,
        skills: skills || [],
        status: "available",
        currentLocation: null,
        latitude: null,
        longitude: null,
        teamId: null,
        performanceRating: 5,
        completedIssues: 0,
        avgResolutionTime: 0
      });

      res.status(201).json(newTechnician);
    } catch (error) {
      console.error("Error creating technician:", error);
      res.status(500).json({ message: "Failed to create technician" });
    }
  });

  // Find nearest technicians endpoint
  app.post("/api/technicians/nearest", async (req, res) => {
    try {
      const { latitude, longitude, department } = req.body;
      
      // Get all available technicians from the specified department
      let technicians;
      if (department) {
        technicians = await storage.getTechniciansByDepartment(department);
      } else {
        technicians = await storage.getTechnicians();
      }
      
      // Filter only available technicians
      const availableTechnicians = technicians.filter(tech => tech.status === "available");
      
      // Calculate distances and sort by nearest (mock calculation for demo)
      const technicianWithDistances = availableTechnicians.map(tech => ({
        ...tech,
        distance: Math.random() * 10 + 1, // Mock distance in km
        estimatedArrival: Math.floor(Math.random() * 30) + 10 // Mock arrival time in minutes
      })).sort((a, b) => a.distance - b.distance);
      
      res.json(technicianWithDistances.slice(0, 5)); // Return top 5 nearest
    } catch (error) {
      res.status(500).json({ message: "Failed to find nearest technicians" });
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

  // Assign technician to issue
  app.post("/api/technicians/:technicianId/assign/:issueId", async (req, res) => {
    try {
      const technicianId = parseInt(req.params.technicianId);
      const issueId = parseInt(req.params.issueId);

      if (isNaN(technicianId) || isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid technician or issue ID" });
      }

      const success = await storage.assignTechnicianToIssue(technicianId, issueId);
      
      if (!success) {
        return res.status(404).json({ message: "Technician or issue not found" });
      }

      res.json({ success: true, message: "Technician assigned successfully" });
    } catch (error) {
      console.error("Error assigning technician:", error);
      res.status(500).json({ message: "Failed to assign technician" });
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
      
      // Prioritize technicians from the requested department, but include others if needed
      let departmentTechnicians: any[] = [];
      let otherTechnicians: any[] = [];
      
      if (department) {
        departmentTechnicians = technicians.filter(tech => tech.department === department);
        otherTechnicians = technicians.filter(tech => tech.department !== department);
      } else {
        departmentTechnicians = technicians;
      }

      // Calculate distances for department technicians first
      const departmentTechsWithDistance = departmentTechnicians
        .filter(tech => tech.latitude && tech.longitude)
        .map(tech => {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(tech.latitude!),
            parseFloat(tech.longitude!)
          );
          return { ...tech, distance, estimatedArrival: Math.ceil(distance * 2.5) };
        })
        .sort((a, b) => a.distance - b.distance);

      // Calculate distances for other technicians
      const otherTechsWithDistance = otherTechnicians
        .filter(tech => tech.latitude && tech.longitude)
        .map(tech => {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(tech.latitude!),
            parseFloat(tech.longitude!)
          );
          return { ...tech, distance, estimatedArrival: Math.ceil(distance * 2.5) };
        })
        .sort((a, b) => a.distance - b.distance);

      // Combine results - department technicians first, then others
      const allTechniciansWithDistance = [...departmentTechsWithDistance, ...otherTechsWithDistance];
      
      // Return top 5 closest technicians
      res.json(allTechniciansWithDistance.slice(0, 5));
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

      // If user is registering as a field technician, create technician record
      if (role === "field_technician") {
        try {
          await storage.createTechnician({
            name,
            phone: phone || "",
            email: email || null,
            department: "General", // Default department
            skills: [], // Empty skills array initially
            status: "available",
            currentLocation: null,
            latitude: null,
            longitude: null,
            teamId: null,
            performanceRating: 5,
            completedIssues: 0,
            avgResolutionTime: 0
          });
        } catch (techError) {
          console.error("Failed to create technician record:", techError);
          // Continue with user registration even if technician creation fails
        }
      }

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

  // Get active work sessions for current technician
  app.get("/api/work-sessions/active", async (req, res) => {
    try {
      // For demo purposes, use technician ID 1 (field technician)
      const technicianId = 1;
      
      // Find issues that are currently in progress for this technician
      const activeIssues = await storage.getIssuesByStatus('in_progress');
      const technicianActiveIssues = activeIssues.filter(issue => 
        issue.assignedTo === technicianId.toString()
      );
      
      // Get stored active work sessions from storage
      const storedSessions = await storage.getActiveWorkSessions();
      
      // Convert to work session format with actual arrival times
      const activeSessions = technicianActiveIssues.map(issue => {
        const storedSession = storedSessions.find(s => s.issueId === issue.id);
        return {
          issueId: issue.id,
          arrivalTime: storedSession?.arrivalTime || issue.updatedAt,
          isActive: true
        };
      });
      
      res.json(activeSessions);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch active work sessions" });
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

  // Chat API routes
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const message = await storage.createChatMessage(req.body);
      
      // Generate bot response for citizen queries
      if (!req.body.isBot && req.body.message) {
        const botResponse = generateBotResponse(req.body.message);
        const botMessage = await storage.createChatMessage({
          sessionId: req.body.sessionId,
          userId: null,
          message: botResponse.message,
          isBot: true,
          messageType: botResponse.type,
          metadata: botResponse.metadata
        });
        
        res.json({ userMessage: message, botMessage });
      } else {
        res.json(message);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // WhatsApp API routes
  app.get("/api/whatsapp", async (req, res) => {
    try {
      const { phoneNumber } = req.query;
      const messages = await storage.getWhatsappMessages(phoneNumber as string);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/whatsapp", async (req, res) => {
    try {
      const message = await storage.createWhatsappMessage(req.body);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      // Handle WhatsApp webhook for incoming messages
      const { messageId, phoneNumber, message, status } = req.body;
      
      if (status) {
        // Update message status
        await storage.updateWhatsappMessageStatus(messageId, status);
      } else if (message) {
        // Create new incoming message
        await storage.createWhatsappMessage({
          phoneNumber,
          message,
          direction: "inbound",
          messageId,
          webhookData: req.body
        });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get conversations for a specific phone number (citizen view)
  app.get('/api/whatsapp/conversations', async (req, res) => {
    try {
      const phoneNumber = req.query.phoneNumber as string;
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      const conversations = await storage.getWhatsappConversationsByPhone(phoneNumber);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get messages for a specific conversation
  app.get('/api/whatsapp/messages', async (req, res) => {
    try {
      const conversationId = parseInt(req.query.conversationId as string);
      if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID is required' });
      }
      const messages = await storage.getWhatsappMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start a new conversation (citizen initiated)
  app.post('/api/whatsapp/start-conversation', async (req, res) => {
    try {
      const { citizenId, phoneNumber, subject, issueCategory, agentId } = req.body;
      
      const conversation = await storage.createWhatsappConversation({
        citizenId,
        phoneNumber,
        subject,
        status: 'open',
        agentId: agentId || null,
        issueId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        closedAt: null
      });

      // Send initial message from citizen
      await storage.createWhatsappMessage({
        phoneNumber,
        message: `Hi, I need help with ${issueCategory}: ${subject}`,
        direction: 'inbound',
        timestamp: new Date(),
        agentId: null,
        status: 'sent',
        messageType: 'text',
        userId: citizenId,
        issueId: null,
        messageId: `msg-${Date.now()}`,
        webhookData: null,
        templateName: null
      });

      res.json(conversation);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send message in existing conversation
  app.post('/api/whatsapp/send-message', async (req, res) => {
    try {
      const { phoneNumber, message, conversationId, direction, userId, messageType = 'text' } = req.body;
      
      const newMessage = await storage.createWhatsappMessage({
        phoneNumber,
        message,
        direction,
        timestamp: new Date(),
        agentId: direction === 'outbound' ? userId : null,
        status: 'sent',
        messageType,
        userId: direction === 'inbound' ? userId : null,
        issueId: null,
        messageId: `msg-${Date.now()}`,
        webhookData: null,
        templateName: null
      });

      // Update conversation last message time
      if (conversationId) {
        await storage.updateWhatsappConversation(conversationId, {
          lastMessageAt: new Date(),
          updatedAt: new Date()
        });
      }

      res.json({ success: true, message: newMessage });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Export report via email
  app.post("/api/export-report", async (req, res) => {
    try {
      const { email, reportData, reportType, fileName } = req.body;

      if (!email || !reportData || !fileName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // In a real implementation, you would:
      // 1. Use a service like SendGrid, Mailgun, or AWS SES to send emails
      // 2. Attach the CSV file to the email
      // 3. Store the email sending record for audit purposes

      // For demo purposes, we'll simulate email sending
      console.log(`Simulating email send to: ${email}`);
      console.log(`Report type: ${reportType}`);
      console.log(`File name: ${fileName}`);
      console.log(`Report data length: ${reportData.length} characters`);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      res.json({ 
        success: true, 
        message: `Report sent successfully to ${email}`,
        emailId: `email_${Date.now()}`
      });
    } catch (error) {
      console.error("Error sending report via email:", error);
      res.status(500).json({ message: "Failed to send report via email" });
    }
  });

  // WhatsApp Communication Routes for Call Center Agents
  app.get("/api/whatsapp/conversations", async (req, res) => {
    try {
      const conversations = await storage.getWhatsappConversations();
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch conversations: " + error.message });
    }
  });

  app.get("/api/whatsapp/messages/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const messages = await storage.getWhatsappMessages(phoneNumber);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch messages: " + error.message });
    }
  });

  app.post("/api/whatsapp/send-message", async (req, res) => {
    try {
      const { phoneNumber, message, agentId, issueId } = req.body;
      
      const whatsappMessage = await storage.createWhatsappMessage({
        phoneNumber,
        message,
        direction: "outbound",
        agentId,
        issueId,
        messageType: "text",
        status: "sent",
        userId: null,
        messageId: null,
        webhookData: null,
        templateName: null
      });

      // In a real implementation, integrate with WhatsApp Business API
      // For demo purposes, we'll simulate sending
      
      res.json({ success: true, message: whatsappMessage });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send message: " + error.message });
    }
  });

  app.post("/api/whatsapp/start-conversation", async (req, res) => {
    try {
      const { citizenId, phoneNumber, agentId, subject, issueId } = req.body;
      
      const conversation = await storage.createWhatsappConversation({
        citizenId,
        phoneNumber,
        agentId,
        subject,
        issueId,
        status: "open"
      });

      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to start conversation: " + error.message });
    }
  });

  app.patch("/api/whatsapp/conversations/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, agentId } = req.body;
      
      await storage.updateWhatsappConversationStatus(parseInt(id), status, agentId);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update conversation: " + error.message });
    }
  });

  app.get("/api/whatsapp/unread-count", async (req, res) => {
    try {
      const unreadCount = await storage.getUnreadWhatsappCount();
      res.json(unreadCount);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get unread count: " + error.message });
    }
  });

  return httpServer;
}

// Chatbot response generator for citizens
function generateBotResponse(userMessage: string) {
  const message = userMessage.toLowerCase();
  
  // Common municipal service queries
  if (message.includes('water') || message.includes('leak') || message.includes('pipe')) {
    return {
      message: "I can help you with water-related issues. You can:\n• Report a water leak\n• Check service outages\n• Request meter readings\n• Pay water bills\n\nWould you like me to help you report a water issue?",
      type: "quick_reply",
      metadata: {
        options: ["Report Water Leak", "Check Outages", "Pay Bill", "Other"]
      }
    };
  }
  
  if (message.includes('electricity') || message.includes('power') || message.includes('outage')) {
    return {
      message: "I can assist with electricity services:\n• Report power outages\n• Check load shedding schedules\n• Report street light issues\n• Pay electricity bills\n\nWhat electricity issue can I help you with?",
      type: "quick_reply",
      metadata: {
        options: ["Report Outage", "Load Shedding", "Street Lights", "Pay Bill"]
      }
    };
  }
  
  if (message.includes('waste') || message.includes('garbage') || message.includes('refuse')) {
    return {
      message: "For waste management services:\n• Report missed collections\n• Request additional bins\n• Report illegal dumping\n• Schedule bulk waste pickup\n\nHow can I help with waste services?",
      type: "quick_reply",
      metadata: {
        options: ["Missed Collection", "Request Bins", "Report Dumping", "Bulk Pickup"]
      }
    };
  }
  
  if (message.includes('road') || message.includes('pothole') || message.includes('traffic')) {
    return {
      message: "I can help with road and transport issues:\n• Report potholes\n• Report traffic light problems\n• Request road maintenance\n• Report damaged road signs\n\nWhat road issue would you like to report?",
      type: "quick_reply",
      metadata: {
        options: ["Report Pothole", "Traffic Lights", "Road Maintenance", "Road Signs"]
      }
    };
  }
  
  if (message.includes('bill') || message.includes('pay') || message.includes('payment')) {
    return {
      message: "I can help you with payments and billing:\n• Pay municipal bills\n• Check account balance\n• Download statements\n• Set up payment arrangements\n\nWhat payment service do you need?",
      type: "quick_reply",
      metadata: {
        options: ["Pay Bills", "Check Balance", "Statements", "Payment Plan"]
      }
    };
  }
  
  if (message.includes('voucher') || message.includes('prepaid')) {
    return {
      message: "For prepaid services:\n• Purchase electricity vouchers\n• Purchase water vouchers\n• Check voucher history\n• Get voucher support\n\nWhich voucher service do you need?",
      type: "quick_reply",
      metadata: {
        options: ["Buy Electricity", "Buy Water", "Voucher History", "Support"]
      }
    };
  }
  
  if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
    return {
      message: "Hello! I'm your municipal services assistant. I can help you with:\n\n🏠 Report issues (water, electricity, roads, waste)\n💳 Pay bills and buy vouchers\n📍 Track service requests\n📞 Connect with support\n\nWhat can I help you with today?",
      type: "quick_reply",
      metadata: {
        options: ["Report Issue", "Pay Bills", "Track Request", "Get Support"]
      }
    };
  }
  
  // Default response
  return {
    message: "I'm here to help with municipal services. You can ask me about:\n• Water and sanitation\n• Electricity services\n• Waste management\n• Roads and transport\n• Bill payments\n• Prepaid vouchers\n\nPlease tell me what you need assistance with, or type 'help' for more options.",
    type: "text",
    metadata: null
  };
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
