import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIssueSchema, insertPaymentSchema } from "@shared/schema";
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
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, email, phone, role } = req.body;
      
      if (!username || !password || !name) {
        return res.status(400).json({ message: "Username, password, and name are required" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password,
        name,
        email: email || null,
        phone: phone || null,
        role: role || "citizen",
      });

      res.json({ 
        message: "Registration successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  const httpServer = createServer(app);
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
