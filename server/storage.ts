import { users, issues, payments, teams, type User, type InsertUser, type Issue, type InsertIssue, type Payment, type InsertPayment, type Team, type InsertTeam } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Issue operations
  getIssues(): Promise<Issue[]>;
  getIssue(id: number): Promise<Issue | undefined>;
  getIssuesByStatus(status: string): Promise<Issue[]>;
  getIssuesByCategory(category: string): Promise<Issue[]>;
  getIssuesByWard(ward: string): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined>;
  deleteIssue(id: number): Promise<boolean>;

  // Payment operations
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByType(type: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined>;

  // Team operations
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsByDepartment(department: string): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private issues: Map<number, Issue>;
  private payments: Map<number, Payment>;
  private teams: Map<number, Team>;
  private currentUserId: number;
  private currentIssueId: number;
  private currentPaymentId: number;
  private currentTeamId: number;

  constructor() {
    this.users = new Map();
    this.issues = new Map();
    this.payments = new Map();
    this.teams = new Map();
    this.currentUserId = 1;
    this.currentIssueId = 1;
    this.currentPaymentId = 1;
    this.currentTeamId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed teams
    const sampleTeams: Team[] = [
      {
        id: this.currentTeamId++,
        name: "Water Maintenance Team A",
        department: "Water & Sanitation",
        status: "available",
        currentLocation: "Sector 3",
        members: ["Mike Johnson", "Sarah Wilson"],
        equipment: ["Water Tanker #03", "Repair Tools"],
        lastUpdate: new Date(),
      },
      {
        id: this.currentTeamId++,
        name: "Road Repair Crew B",
        department: "Roads & Transport",
        status: "on_job",
        currentLocation: "Main Street",
        members: ["David Brown", "Lisa Garcia"],
        equipment: ["Asphalt Mixer", "Road Roller"],
        lastUpdate: new Date(),
      },
      {
        id: this.currentTeamId++,
        name: "Electricity Repair Team C",
        department: "Electricity",
        status: "available",
        currentLocation: "Ward 2",
        members: ["John Smith", "Mary Johnson"],
        equipment: ["Power Tools", "Emergency Generator"],
        lastUpdate: new Date(),
      },
    ];

    sampleTeams.forEach(team => this.teams.set(team.id, team));

    // Seed payments
    const samplePayments: Payment[] = [
      {
        id: this.currentPaymentId++,
        type: "water",
        amount: 34250,
        dueDate: new Date("2025-01-15"),
        status: "pending",
        accountNumber: "W001234",
        description: "Water Bill - December 2024",
        createdAt: new Date(),
      },
      {
        id: this.currentPaymentId++,
        type: "electricity",
        amount: 15875,
        dueDate: new Date("2025-01-20"),
        status: "pending",
        accountNumber: "E005678",
        description: "Electricity Bill - December 2024",
        createdAt: new Date(),
      },
      {
        id: this.currentPaymentId++,
        type: "rates",
        amount: 45000,
        dueDate: new Date("2025-02-01"),
        status: "pending",
        accountNumber: "R012345",
        description: "Property Rates - January 2025",
        createdAt: new Date(),
      },
      {
        id: this.currentPaymentId++,
        type: "fine",
        amount: 2500,
        dueDate: new Date("2024-12-15"),
        status: "overdue",
        accountNumber: "F098765",
        description: "Traffic Fine - Speeding",
        createdAt: new Date(),
      },
    ];

    samplePayments.forEach(payment => this.payments.set(payment.id, payment));

    // Seed sample issues
    const sampleIssues: Issue[] = [
      {
        id: this.currentIssueId++,
        title: "Water leak on Main Street",
        description: "There is a significant water leak causing flooding on Main Street near the shopping center. The water pressure in surrounding areas has been affected.",
        category: "water_sanitation",
        priority: "high",
        status: "in_progress",
        location: "Main Street, near Shoprite",
        ward: "Ward 1",
        reporterName: "John Doe",
        reporterPhone: "0821234567",
        assignedTo: "Water Maintenance Team A",
        photos: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        resolvedAt: null,
        rating: null,
        feedback: null,
      },
      {
        id: this.currentIssueId++,
        title: "Pothole on Church Street",
        description: "Large pothole causing damage to vehicles. Multiple residents have reported flat tires.",
        category: "roads_transport",
        priority: "medium",
        status: "open",
        location: "Church Street, outside Post Office",
        ward: "Ward 2",
        reporterName: "Mary Smith",
        reporterPhone: "0829876543",
        assignedTo: null,
        photos: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        resolvedAt: null,
        rating: null,
        feedback: null,
      },
      {
        id: this.currentIssueId++,
        title: "Street light not working",
        description: "Street light has been out for over a week, creating safety concerns for pedestrians at night.",
        category: "electricity",
        priority: "medium",
        status: "assigned",
        location: "Corner of Oak and Pine Streets",
        ward: "Ward 1",
        reporterName: "Peter Jones",
        reporterPhone: "0835551234",
        assignedTo: "Electricity Repair Team C",
        photos: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        resolvedAt: null,
        rating: null,
        feedback: null,
      },
      {
        id: this.currentIssueId++,
        title: "Illegal dumping in vacant lot",
        description: "Someone has been dumping household waste in the vacant lot behind the community center. This is attracting rats and creating health hazards.",
        category: "waste_management",
        priority: "high",
        status: "resolved",
        location: "Vacant lot behind Community Center",
        ward: "Ward 3",
        reporterName: "Sarah Williams",
        reporterPhone: "0847778888",
        assignedTo: "Waste Management Team",
        photos: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        rating: 4,
        feedback: "Quick response and thorough cleanup. Thank you!",
      },
      {
        id: this.currentIssueId++,
        title: "Broken playground equipment",
        description: "The swing set in the park has broken chains. This is dangerous for children.",
        category: "safety_security",
        priority: "emergency",
        status: "open",
        location: "Central Park Playground",
        ward: "Ward 2",
        reporterName: "Lisa Brown",
        reporterPhone: "0823334444",
        assignedTo: null,
        photos: null,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        resolvedAt: null,
        rating: null,
        feedback: null,
      },
      {
        id: this.currentIssueId++,
        title: "Blocked storm drain",
        description: "Storm drain is completely blocked with debris, causing water to pool during rain.",
        category: "water_sanitation",
        priority: "medium",
        status: "in_progress",
        location: "Valley Road near the bridge",
        ward: "Ward 1",
        reporterName: "Michael Davis",
        reporterPhone: "0812223333",
        assignedTo: "Water Maintenance Team A",
        photos: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        resolvedAt: null,
        rating: null,
        feedback: null,
      },
    ];

    sampleIssues.forEach(issue => this.issues.set(issue.id, issue));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Issue operations
  async getIssues(): Promise<Issue[]> {
    return Array.from(this.issues.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async getIssuesByStatus(status: string): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(issue => issue.status === status);
  }

  async getIssuesByCategory(category: string): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(issue => issue.category === category);
  }

  async getIssuesByWard(ward: string): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(issue => issue.ward === ward);
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = this.currentIssueId++;
    const now = new Date();
    const issue: Issue = {
      ...insertIssue,
      id,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      rating: null,
      feedback: null,
    };
    this.issues.set(id, issue);
    return issue;
  }

  async updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined> {
    const issue = this.issues.get(id);
    if (!issue) return undefined;

    const updatedIssue: Issue = {
      ...issue,
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.status === "resolved" && !issue.resolvedAt) {
      updatedIssue.resolvedAt = new Date();
    }

    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  async deleteIssue(id: number): Promise<boolean> {
    return this.issues.delete(id);
  }

  // Payment operations
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByType(type: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.type === type);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updatedPayment: Payment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamsByDepartment(department: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.department === department);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const team: Team = {
      ...insertTeam,
      id,
      lastUpdate: new Date(),
    };
    this.teams.set(id, team);
    return team;
  }

  async updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;

    const updatedTeam: Team = {
      ...team,
      ...updates,
      lastUpdate: new Date(),
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }
}

export const storage = new MemStorage();
