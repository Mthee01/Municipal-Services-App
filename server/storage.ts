import { 
  users, issues, payments, teams, technicians, wards, issueUpdates, vouchers,
  type User, type InsertUser, type Issue, type InsertIssue, 
  type Payment, type InsertPayment, type Team, type InsertTeam,
  type Technician, type InsertTechnician, type Ward, type InsertWard,
  type IssueUpdate, type InsertIssueUpdate, type Voucher, type InsertVoucher
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

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

  // Technician operations
  getTechnicians(): Promise<Technician[]>;
  getTechnician(id: number): Promise<Technician | undefined>;
  getTechniciansByDepartment(department: string): Promise<Technician[]>;
  getTechniciansByStatus(status: string): Promise<Technician[]>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined>;
  assignTechnicianToIssue(technicianId: number, issueId: number): Promise<boolean>;

  // Ward operations
  getWards(): Promise<Ward[]>;
  getWard(id: number): Promise<Ward | undefined>;
  getWardByNumber(wardNumber: string): Promise<Ward | undefined>;
  createWard(ward: InsertWard): Promise<Ward>;
  updateWard(id: number, updates: Partial<Ward>): Promise<Ward | undefined>;

  // Issue update operations
  getIssueUpdates(issueId: number): Promise<IssueUpdate[]>;
  createIssueUpdate(update: InsertIssueUpdate): Promise<IssueUpdate>;

  // Voucher operations
  getVouchers(): Promise<Voucher[]>;
  getVoucher(id: number): Promise<Voucher | undefined>;
  getVouchersByType(type: string): Promise<Voucher[]>;
  getVoucherByCode(code: string): Promise<Voucher | undefined>;
  createVoucher(voucher: InsertVoucher): Promise<Voucher>;
  updateVoucher(id: number, updates: Partial<Voucher>): Promise<Voucher | undefined>;
  useVoucher(voucherCode: string): Promise<boolean>;

  // Analytics operations
  getWardStats(wardNumber?: string): Promise<any>;
  getTechnicianPerformance(): Promise<any>;
  getMunicipalityStats(): Promise<any>;
  getDepartmentStats(department?: string): Promise<any>;

  // Financial Management operations
  getBillingAccounts(): Promise<any[]>;
  getBillingAccount(id: number): Promise<any | undefined>;
  createBillingAccount(account: any): Promise<any>;
  updateBillingAccount(id: number, updates: any): Promise<any | undefined>;

  getBills(): Promise<any[]>;
  getBillsByAccount(accountId: number): Promise<any[]>;
  getBillsByStatus(status: string): Promise<any[]>;
  getBillsByServiceType(serviceType: string): Promise<any[]>;
  createBill(bill: any): Promise<any>;
  updateBill(id: number, updates: any): Promise<any | undefined>;

  getMunicipalPayments(): Promise<any[]>;
  getPaymentsByAccount(accountId: number): Promise<any[]>;
  getPaymentsByStatus(status: string): Promise<any[]>;
  createMunicipalPayment(payment: any): Promise<any>;
  updatePaymentStatus(id: number, status: string, reversalReason?: string): Promise<any | undefined>;

  getRevenueDashboard(): Promise<any>;
  getRevenueReports(filters: any): Promise<any[]>;
  generateRevenueReport(reportData: any): Promise<any>;

  getPaymentPlans(accountId?: number, status?: string): Promise<any[]>;
  createPaymentPlan(plan: any): Promise<any>;
  updatePaymentPlan(id: number, updates: any): Promise<any | undefined>;

  getTariffStructures(serviceType?: string, customerCategory?: string): Promise<any[]>;
  getCollectionSummary(period: string, serviceType?: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private issues: Map<number, Issue>;
  private payments: Map<number, Payment>;
  private teams: Map<number, Team>;
  private technicians: Map<number, Technician>;
  private wards: Map<number, Ward>;
  private issueUpdates: Map<number, IssueUpdate>;
  private vouchers: Map<number, Voucher>;
  private currentUserId: number;
  private currentIssueId: number;
  private currentPaymentId: number;
  private currentTeamId: number;
  private currentTechnicianId: number;
  private currentWardId: number;
  private currentIssueUpdateId: number;
  private currentVoucherId: number;

  // Financial Management storage
  private billingAccounts: Map<number, any>;
  private bills: Map<number, any>;
  private municipalPayments: Map<number, any>;
  private paymentPlans: Map<number, any>;
  private tariffStructures: Map<number, any>;
  private revenueReports: Map<number, any>;
  private currentBillingAccountId: number;
  private currentBillId: number;
  private currentMunicipalPaymentId: number;
  private currentPaymentPlanId: number;
  private currentTariffId: number;
  private currentRevenueReportId: number;

  constructor() {
    this.users = new Map();
    this.issues = new Map();
    this.payments = new Map();
    this.teams = new Map();
    this.technicians = new Map();
    this.wards = new Map();
    this.issueUpdates = new Map();
    this.vouchers = new Map();
    this.currentUserId = 1;
    this.currentIssueId = 1;
    this.currentPaymentId = 1;
    this.currentTeamId = 1;
    this.currentTechnicianId = 1;
    this.currentWardId = 1;
    this.currentIssueUpdateId = 1;
    this.currentVoucherId = 1;
    this.currentBillingAccountId = 1;
    this.currentBillId = 1;
    this.currentMunicipalPaymentId = 1;
    this.currentPaymentPlanId = 1;
    this.currentTariffId = 1;
    this.currentRevenueReportId = 1;

    this.seedData();
    this.seedFinancialData();
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

    // Seed wards
    const sampleWards: Ward[] = [
      {
        id: this.currentWardId++,
        wardNumber: "Ward 1",
        name: "Central Business District",
        councillorName: "John Mthembu",
        councillorPhone: "0827771234",
        councillorEmail: "j.mthembu@municipality.gov.za",
        population: 12500,
        area: "15.2 km²",
        description: "Central business district with high commercial activity",
      },
      {
        id: this.currentWardId++,
        wardNumber: "Ward 2", 
        name: "Residential North",
        councillorName: "Mary Nkomo",
        councillorPhone: "0829998877",
        councillorEmail: "m.nkomo@municipality.gov.za",
        population: 18750,
        area: "22.8 km²",
        description: "Primarily residential area with schools and clinics",
      },
      {
        id: this.currentWardId++,
        wardNumber: "Ward 3",
        name: "Industrial South",
        councillorName: "Peter Williams", 
        councillorPhone: "0835554321",
        councillorEmail: "p.williams@municipality.gov.za",
        population: 9800,
        area: "28.5 km²",
        description: "Industrial zone with manufacturing facilities",
      },
    ];

    sampleWards.forEach(ward => this.wards.set(ward.id, ward));

    // Seed technicians
    const sampleTechnicians: Technician[] = [
      {
        id: this.currentTechnicianId++,
        name: "Mike Johnson",
        phone: "0821234567",
        email: "m.johnson@municipality.gov.za",
        department: "Water & Sanitation",
        skills: ["Plumbing", "Water Systems", "Pipe Repair"],
        status: "on_job",
        currentLocation: "Main Street, near Shoprite",
        latitude: "-25.7461",
        longitude: "28.1881",
        teamId: 1,
        performanceRating: 4,
        completedIssues: 23,
        avgResolutionTime: 18,
        lastUpdate: new Date(),
      },
      {
        id: this.currentTechnicianId++,
        name: "Sarah Wilson",
        phone: "0829876543", 
        email: "s.wilson@municipality.gov.za",
        department: "Water & Sanitation",
        skills: ["Water Quality", "System Maintenance", "Emergency Response"],
        status: "available",
        currentLocation: "Municipal Depot",
        latitude: "-25.7512",
        longitude: "28.1923",
        teamId: 1,
        performanceRating: 5,
        completedIssues: 31,
        avgResolutionTime: 15,
        lastUpdate: new Date(),
      },
      {
        id: this.currentTechnicianId++,
        name: "David Brown",
        phone: "0835551111",
        email: "d.brown@municipality.gov.za", 
        department: "Roads & Transport",
        skills: ["Road Repair", "Asphalt Work", "Traffic Management"],
        status: "on_job",
        currentLocation: "Main Street",
        latitude: "-25.7488",
        longitude: "28.1902",
        teamId: 2,
        performanceRating: 4,
        completedIssues: 19,
        avgResolutionTime: 24,
        lastUpdate: new Date(),
      },
      {
        id: this.currentTechnicianId++,
        name: "Lisa Garcia",
        phone: "0847772222",
        email: "l.garcia@municipality.gov.za",
        department: "Roads & Transport", 
        skills: ["Pothole Repair", "Road Marking", "Drainage"],
        status: "available",
        currentLocation: "Ward 2 Office",
        latitude: "-25.7333",
        longitude: "28.2001",
        teamId: 2,
        performanceRating: 4,
        completedIssues: 27,
        avgResolutionTime: 20,
        lastUpdate: new Date(),
      },
      {
        id: this.currentTechnicianId++,
        name: "John Smith",
        phone: "0823334444",
        email: "j.smith@municipality.gov.za",
        department: "Electricity",
        skills: ["Electrical Repair", "Street Lighting", "Power Systems"],
        status: "on_job",
        currentLocation: "Corner of Oak and Pine Streets",
        latitude: "-25.7401",
        longitude: "28.1856",
        teamId: 3,
        performanceRating: 5,
        completedIssues: 35,
        avgResolutionTime: 12,
        lastUpdate: new Date(),
      },
      {
        id: this.currentTechnicianId++,
        name: "Mary Johnson",
        phone: "0819995555",
        email: "m.johnson2@municipality.gov.za",
        department: "Electricity",
        skills: ["Generator Maintenance", "Emergency Power", "Electrical Safety"],
        status: "available", 
        currentLocation: "Electrical Depot",
        latitude: "-25.7544",
        longitude: "28.1777",
        teamId: 3,
        performanceRating: 4,
        completedIssues: 22,
        avgResolutionTime: 16,
        lastUpdate: new Date(),
      },
    ];

    sampleTechnicians.forEach(technician => this.technicians.set(technician.id, technician));
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      municipalityAccountNo: insertUser.municipalityAccountNo ?? null,
      role: insertUser.role || 'citizen'
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      id, // Ensure ID doesn't change
      email: updates.email !== undefined ? updates.email : user.email,
      phone: updates.phone !== undefined ? updates.phone : user.phone,
      municipalityAccountNo: updates.municipalityAccountNo !== undefined ? updates.municipalityAccountNo : user.municipalityAccountNo,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
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
      photos: insertIssue.photos ?? null,
      status: insertIssue.status || "open",
      priority: insertIssue.priority || "medium",
      ward: insertIssue.ward ?? null,
      reporterName: insertIssue.reporterName ?? null,
      reporterPhone: insertIssue.reporterPhone ?? null,
      assignedTo: insertIssue.assignedTo ?? null,
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
      status: insertPayment.status || 'pending',
      description: insertPayment.description ?? null,
      accountNumber: insertPayment.accountNumber ?? null,
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
      status: insertTeam.status || "available",
      currentLocation: insertTeam.currentLocation ?? null,
      members: insertTeam.members ?? null,
      equipment: insertTeam.equipment ?? null,
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

  // Technician operations
  async getTechnicians(): Promise<Technician[]> {
    return Array.from(this.technicians.values());
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    return this.technicians.get(id);
  }

  async getTechniciansByDepartment(department: string): Promise<Technician[]> {
    return Array.from(this.technicians.values()).filter(tech => tech.department === department);
  }

  async getTechniciansByStatus(status: string): Promise<Technician[]> {
    return Array.from(this.technicians.values()).filter(tech => tech.status === status);
  }

  async createTechnician(insertTechnician: InsertTechnician): Promise<Technician> {
    const id = this.currentTechnicianId++;
    const technician: Technician = {
      ...insertTechnician,
      id,
      email: insertTechnician.email ?? null,
      status: insertTechnician.status || "available",
      currentLocation: insertTechnician.currentLocation ?? null,
      skills: insertTechnician.skills ?? null,
      latitude: insertTechnician.latitude ?? null,
      longitude: insertTechnician.longitude ?? null,
      completedIssues: insertTechnician.completedIssues ?? null,
      performanceRating: insertTechnician.performanceRating ?? null,
      avgResolutionTime: insertTechnician.avgResolutionTime ?? null,
      lastUpdate: new Date(),
    };
    this.technicians.set(id, technician);
    return technician;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const technician = this.technicians.get(id);
    if (!technician) return undefined;

    const updatedTechnician: Technician = {
      ...technician,
      ...updates,
      lastUpdate: new Date(),
    };
    this.technicians.set(id, updatedTechnician);
    return updatedTechnician;
  }

  async assignTechnicianToIssue(technicianId: number, issueId: number): Promise<boolean> {
    const technician = this.technicians.get(technicianId);
    const issue = this.issues.get(issueId);
    
    if (!technician || !issue) return false;

    // Update issue with assigned technician
    const updatedIssue = await this.updateIssue(issueId, {
      assignedTo: technician.name,
      status: "assigned"
    });

    // Update technician status
    await this.updateTechnician(technicianId, {
      status: "on_job"
    });

    // Create issue update record
    await this.createIssueUpdate({
      issueId,
      status: "assigned",
      comment: `Assigned to ${technician.name}`,
      updatedBy: "System",
      technicianId,
    });

    return true;
  }

  // Ward operations
  async getWards(): Promise<Ward[]> {
    return Array.from(this.wards.values());
  }

  async getWard(id: number): Promise<Ward | undefined> {
    return this.wards.get(id);
  }

  async getWardByNumber(wardNumber: string): Promise<Ward | undefined> {
    return Array.from(this.wards.values()).find(ward => ward.wardNumber === wardNumber);
  }

  async createWard(insertWard: InsertWard): Promise<Ward> {
    const id = this.currentWardId++;
    const ward: Ward = { 
      ...insertWard, 
      id,
      area: insertWard.area ?? null,
      description: insertWard.description ?? null,
      councillorName: insertWard.councillorName ?? null,
      councillorPhone: insertWard.councillorPhone ?? null,
      councillorEmail: insertWard.councillorEmail ?? null,
      population: insertWard.population ?? null
    };
    this.wards.set(id, ward);
    return ward;
  }

  async updateWard(id: number, updates: Partial<Ward>): Promise<Ward | undefined> {
    const ward = this.wards.get(id);
    if (!ward) return undefined;

    const updatedWard: Ward = { ...ward, ...updates };
    this.wards.set(id, updatedWard);
    return updatedWard;
  }

  // Issue update operations
  async getIssueUpdates(issueId: number): Promise<IssueUpdate[]> {
    return Array.from(this.issueUpdates.values())
      .filter(update => update.issueId === issueId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createIssueUpdate(insertUpdate: InsertIssueUpdate): Promise<IssueUpdate> {
    const id = this.currentIssueUpdateId++;
    const update: IssueUpdate = {
      ...insertUpdate,
      id,
      technicianId: insertUpdate.technicianId ?? null,
      comment: insertUpdate.comment ?? null,
      updatedBy: insertUpdate.updatedBy ?? null,
      createdAt: new Date(),
    };
    this.issueUpdates.set(id, update);
    return update;
  }

  // Analytics operations
  async getWardStats(wardNumber?: string): Promise<any> {
    const allIssues = Array.from(this.issues.values());
    const wardIssues = wardNumber 
      ? allIssues.filter(issue => issue.ward === wardNumber)
      : allIssues;

    const totalIssues = wardIssues.length;
    const openIssues = wardIssues.filter(i => i.status === "open").length;
    const inProgress = wardIssues.filter(i => i.status === "in_progress").length;
    const resolved = wardIssues.filter(i => i.status === "resolved").length;
    const avgRating = wardIssues.filter(i => i.rating).reduce((acc, i) => acc + (i.rating || 0), 0) / wardIssues.filter(i => i.rating).length || 0;

    const categoryStats = {};
    wardIssues.forEach(issue => {
      categoryStats[issue.category] = (categoryStats[issue.category] || 0) + 1;
    });

    const priorityStats = {};
    wardIssues.forEach(issue => {
      priorityStats[issue.priority] = (priorityStats[issue.priority] || 0) + 1;
    });

    return {
      totalIssues,
      openIssues,
      inProgress,
      resolved,
      resolutionRate: totalIssues > 0 ? (resolved / totalIssues * 100) : 0,
      avgRating: Math.round(avgRating * 10) / 10,
      categoryStats,
      priorityStats,
    };
  }

  async getTechnicianPerformance(): Promise<any> {
    const technicians = Array.from(this.technicians.values());
    
    return technicians.map(tech => ({
      id: tech.id,
      name: tech.name,
      department: tech.department,
      status: tech.status,
      performanceRating: tech.performanceRating,
      completedIssues: tech.completedIssues,
      avgResolutionTime: tech.avgResolutionTime,
      currentLocation: tech.currentLocation,
      latitude: tech.latitude,
      longitude: tech.longitude,
    }));
  }

  async getMunicipalityStats(): Promise<any> {
    const allIssues = Array.from(this.issues.values());
    const allTechnicians = Array.from(this.technicians.values());
    const allWards = Array.from(this.wards.values());

    const totalPopulation = allWards.reduce((acc, ward) => acc + (ward.population || 0), 0);
    const totalIssues = allIssues.length;
    const resolvedIssues = allIssues.filter(i => i.status === "resolved").length;
    const avgResolutionTime = allTechnicians.reduce((acc, t) => acc + t.avgResolutionTime, 0) / allTechnicians.length;
    const avgPerformanceRating = allTechnicians.reduce((acc, t) => acc + t.performanceRating, 0) / allTechnicians.length;

    const issuesPerWard = {};
    allIssues.forEach(issue => {
      const ward = issue.ward || "Unassigned";
      issuesPerWard[ward] = (issuesPerWard[ward] || 0) + 1;
    });

    const departmentStats = {};
    allTechnicians.forEach(tech => {
      if (!departmentStats[tech.department]) {
        departmentStats[tech.department] = {
          totalTechnicians: 0,
          availableTechnicians: 0,
          avgPerformance: 0,
          completedIssues: 0,
        };
      }
      departmentStats[tech.department].totalTechnicians++;
      if (tech.status === "available") departmentStats[tech.department].availableTechnicians++;
      departmentStats[tech.department].avgPerformance += tech.performanceRating;
      departmentStats[tech.department].completedIssues += tech.completedIssues;
    });

    Object.keys(departmentStats).forEach(dept => {
      departmentStats[dept].avgPerformance = departmentStats[dept].avgPerformance / departmentStats[dept].totalTechnicians;
    });

    return {
      totalPopulation,
      totalIssues,
      resolvedIssues,
      resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100) : 0,
      avgResolutionTime: Math.round(avgResolutionTime),
      avgPerformanceRating: Math.round(avgPerformanceRating * 10) / 10,
      issuesPerWard,
      departmentStats,
      totalWards: allWards.length,
      totalTechnicians: allTechnicians.length,
    };
  }

  async getDepartmentStats(department?: string): Promise<any> {
    const allIssues = Array.from(this.issues.values());
    const allTechnicians = Array.from(this.technicians.values());

    let departmentIssues = allIssues;
    let departmentTechnicians = allTechnicians;

    if (department) {
      // Map categories to departments
      const categoryToDepartment = {
        "water_sanitation": "Water & Sanitation",
        "electricity": "Electricity",
        "roads_transport": "Roads & Transport",
        "waste_management": "Waste Management",
      };

      departmentIssues = allIssues.filter(issue => {
        const issueDept = categoryToDepartment[issue.category];
        return issueDept === department;
      });

      departmentTechnicians = allTechnicians.filter(tech => tech.department === department);
    }

    const totalTechnicians = departmentTechnicians.length;
    const availableTechnicians = departmentTechnicians.filter(t => t.status === "available").length;
    const onJobTechnicians = departmentTechnicians.filter(t => t.status === "on_job").length;
    const totalIssues = departmentIssues.length;
    const completedIssues = departmentTechnicians.reduce((acc, t) => acc + t.completedIssues, 0);

    return {
      department: department || "All Departments",
      totalTechnicians,
      availableTechnicians,
      onJobTechnicians,
      totalIssues,
      completedIssues,
      avgPerformance: departmentTechnicians.length > 0 
        ? departmentTechnicians.reduce((acc, t) => acc + t.performanceRating, 0) / departmentTechnicians.length 
        : 0,
      avgResolutionTime: departmentTechnicians.length > 0
        ? departmentTechnicians.reduce((acc, t) => acc + t.avgResolutionTime, 0) / departmentTechnicians.length
        : 0,
    };
  }

  // Voucher operations
  async getVouchers(): Promise<Voucher[]> {
    return Array.from(this.vouchers.values());
  }

  async getVoucher(id: number): Promise<Voucher | undefined> {
    return this.vouchers.get(id);
  }

  async getVouchersByType(type: string): Promise<Voucher[]> {
    return Array.from(this.vouchers.values()).filter(v => v.type === type);
  }

  async getVoucherByCode(code: string): Promise<Voucher | undefined> {
    return Array.from(this.vouchers.values()).find(v => v.voucherCode === code);
  }

  async createVoucher(insertVoucher: InsertVoucher): Promise<Voucher> {
    const id = this.currentVoucherId++;
    const voucher: Voucher = {
      ...insertVoucher,
      id,
      status: insertVoucher.status || "active",
      purchasedBy: insertVoucher.purchasedBy ?? null,
      usedDate: insertVoucher.usedDate ?? null,
      purchaseDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };
    this.vouchers.set(id, voucher);
    return voucher;
  }

  async updateVoucher(id: number, updates: Partial<Voucher>): Promise<Voucher | undefined> {
    const voucher = this.vouchers.get(id);
    if (!voucher) return undefined;
    
    const updatedVoucher: Voucher = { ...voucher, ...updates };
    this.vouchers.set(id, updatedVoucher);
    return updatedVoucher;
  }

  async useVoucher(voucherCode: string): Promise<boolean> {
    const voucher = await this.getVoucherByCode(voucherCode);
    if (!voucher || voucher.status !== 'active') return false;
    
    await this.updateVoucher(voucher.id, {
      status: 'used',
      usedDate: new Date(),
    });
    return true;
  }

  private seedFinancialData() {
    // Initialize financial storage maps
    this.billingAccounts = new Map();
    this.bills = new Map();
    this.municipalPayments = new Map();
    this.paymentPlans = new Map();
    this.tariffStructures = new Map();
    this.revenueReports = new Map();

    // Seed sample billing accounts
    const sampleAccounts = [
      {
        id: 1,
        accountNumber: "ACC-001-2024",
        userId: 1,
        accountType: "residential",
        accountStatus: "active",
        customerName: "John Smith",
        billingAddress: "123 Main Street, Johannesburg",
        contactEmail: "john.smith@email.com",
        contactPhone: "+27123456789",
        tariffCategory: "residential_standard",
        currentBalance: 1250.00,
        previousBalance: 950.00,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 2,
        accountNumber: "ACC-002-2024",
        userId: 2,
        accountType: "commercial",
        accountStatus: "active",
        customerName: "ABC Business Ltd",
        billingAddress: "456 Business Ave, Cape Town",
        contactEmail: "billing@abcbusiness.co.za",
        contactPhone: "+27987654321",
        tariffCategory: "commercial_standard",
        currentBalance: 5750.00,
        previousBalance: 4200.00,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: 3,
        accountNumber: "ACC-003-2024",
        userId: 3,
        accountType: "residential",
        accountStatus: "active",
        customerName: "Maria Gonzalez",
        billingAddress: "789 Residential Drive, Durban",
        contactEmail: "maria.g@email.com",
        contactPhone: "+27555123456",
        tariffCategory: "residential_standard",
        currentBalance: 890.00,
        previousBalance: 720.00,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date()
      }
    ];

    sampleAccounts.forEach(account => {
      this.billingAccounts.set(account.id, account);
    });

    // Seed sample bills
    const sampleBills = [
      {
        id: 1,
        billNumber: "BILL-2024-001",
        accountId: 1,
        billType: "monthly",
        serviceType: "water",
        billingPeriodStart: new Date('2024-11-01'),
        billingPeriodEnd: new Date('2024-11-30'),
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-15'),
        consumption: 15.5,
        unitRate: 12.50,
        basicCharge: 45.00,
        consumptionCharge: 193.75,
        vatAmount: 35.81,
        totalAmount: 274.56,
        status: "pending",
        paymentStatus: "unpaid",
        customerName: "John Smith",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date()
      },
      {
        id: 2,
        billNumber: "BILL-2024-002",
        accountId: 1,
        billType: "monthly",
        serviceType: "electricity",
        billingPeriodStart: new Date('2024-11-01'),
        billingPeriodEnd: new Date('2024-11-30'),
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-15'),
        consumption: 450.0,
        unitRate: 1.85,
        basicCharge: 85.00,
        consumptionCharge: 832.50,
        vatAmount: 137.63,
        totalAmount: 1055.13,
        status: "pending",
        paymentStatus: "unpaid",
        customerName: "John Smith",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date()
      },
      {
        id: 3,
        billNumber: "BILL-2024-003",
        accountId: 2,
        billType: "monthly",
        serviceType: "water",
        billingPeriodStart: new Date('2024-11-01'),
        billingPeriodEnd: new Date('2024-11-30'),
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-15'),
        consumption: 85.0,
        unitRate: 15.00,
        basicCharge: 120.00,
        consumptionCharge: 1275.00,
        vatAmount: 209.25,
        totalAmount: 1604.25,
        status: "pending",
        paymentStatus: "partial",
        customerName: "ABC Business Ltd",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date()
      },
      {
        id: 4,
        billNumber: "BILL-2024-004",
        accountId: 3,
        billType: "monthly",
        serviceType: "refuse",
        billingPeriodStart: new Date('2024-11-01'),
        billingPeriodEnd: new Date('2024-11-30'),
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-15'),
        basicCharge: 180.00,
        vatAmount: 27.00,
        totalAmount: 207.00,
        status: "paid",
        paymentStatus: "paid",
        customerName: "Maria Gonzalez",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date()
      }
    ];

    sampleBills.forEach(bill => {
      this.bills.set(bill.id, bill);
    });

    // Seed sample payments
    const samplePayments = [
      {
        id: 1,
        paymentReference: "PAY-2024-001",
        billId: 4,
        accountId: 3,
        paymentType: "bill_payment",
        paymentMethod: "card",
        paymentChannel: "mobile_app",
        amount: 207.00,
        feeAmount: 0.00,
        totalPaid: 207.00,
        paymentDate: new Date('2024-12-05'),
        status: "completed",
        payerName: "Maria Gonzalez",
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date()
      },
      {
        id: 2,
        paymentReference: "PAY-2024-002",
        billId: 3,
        accountId: 2,
        paymentType: "bill_payment",
        paymentMethod: "eft",
        paymentChannel: "bank",
        amount: 800.00,
        feeAmount: 15.00,
        totalPaid: 815.00,
        paymentDate: new Date('2024-12-03'),
        status: "completed",
        payerName: "ABC Business Ltd",
        createdAt: new Date('2024-12-03'),
        updatedAt: new Date()
      },
      {
        id: 3,
        paymentReference: "PAY-2024-003",
        accountId: 1,
        paymentType: "deposit",
        paymentMethod: "cash",
        paymentChannel: "office",
        amount: 500.00,
        feeAmount: 0.00,
        totalPaid: 500.00,
        paymentDate: new Date('2024-12-02'),
        status: "completed",
        payerName: "John Smith",
        cashierName: "Sarah Williams",
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date()
      }
    ];

    samplePayments.forEach(payment => {
      this.municipalPayments.set(payment.id, payment);
    });

    // Update current IDs to continue from seeded data
    this.currentBillingAccountId = 4;
    this.currentBillId = 5;
    this.currentMunicipalPaymentId = 4;
  }

  // Financial Management Operations Implementation

  // Billing Accounts
  async getBillingAccounts(): Promise<any[]> {
    return Array.from(this.billingAccounts.values());
  }

  async getBillingAccount(id: number): Promise<any | undefined> {
    return this.billingAccounts.get(id);
  }

  async createBillingAccount(account: any): Promise<any> {
    const id = this.currentBillingAccountId++;
    const billingAccount = {
      ...account,
      id,
      currentBalance: account.currentBalance || 0,
      previousBalance: account.previousBalance || 0,
      accountStatus: account.accountStatus || "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.billingAccounts.set(id, billingAccount);
    return billingAccount;
  }

  async updateBillingAccount(id: number, updates: any): Promise<any | undefined> {
    const account = this.billingAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...updates, updatedAt: new Date() };
    this.billingAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  // Bills Management
  async getBills(): Promise<any[]> {
    return Array.from(this.bills.values());
  }

  async getBillsByAccount(accountId: number): Promise<any[]> {
    return Array.from(this.bills.values()).filter(bill => bill.accountId === accountId);
  }

  async getBillsByStatus(status: string): Promise<any[]> {
    return Array.from(this.bills.values()).filter(bill => bill.status === status);
  }

  async getBillsByServiceType(serviceType: string): Promise<any[]> {
    return Array.from(this.bills.values()).filter(bill => bill.serviceType === serviceType);
  }

  async createBill(bill: any): Promise<any> {
    const id = this.currentBillId++;
    const newBill = {
      ...bill,
      id,
      billNumber: bill.billNumber || `BILL-${Date.now()}`,
      status: bill.status || "pending",
      paymentStatus: bill.paymentStatus || "unpaid",
      issueDate: bill.issueDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bills.set(id, newBill);
    return newBill;
  }

  async updateBill(id: number, updates: any): Promise<any | undefined> {
    const bill = this.bills.get(id);
    if (!bill) return undefined;
    
    const updatedBill = { ...bill, ...updates, updatedAt: new Date() };
    this.bills.set(id, updatedBill);
    return updatedBill;
  }

  // Municipal Payments
  async getMunicipalPayments(): Promise<any[]> {
    return Array.from(this.municipalPayments.values());
  }

  async getPaymentsByAccount(accountId: number): Promise<any[]> {
    return Array.from(this.municipalPayments.values()).filter(payment => payment.accountId === accountId);
  }

  async getPaymentsByStatus(status: string): Promise<any[]> {
    return Array.from(this.municipalPayments.values()).filter(payment => payment.status === status);
  }

  async createMunicipalPayment(payment: any): Promise<any> {
    const id = this.currentMunicipalPaymentId++;
    const newPayment = {
      ...payment,
      id,
      paymentReference: payment.paymentReference || `PAY-${Date.now()}`,
      status: payment.status || "completed",
      paymentDate: payment.paymentDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.municipalPayments.set(id, newPayment);
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string, reversalReason?: string): Promise<any | undefined> {
    const payment = this.municipalPayments.get(id);
    if (!payment) return undefined;
    
    const updates: any = { status, updatedAt: new Date() };
    if (reversalReason) {
      updates.reversalReason = reversalReason;
      updates.reversalDate = new Date();
    }
    
    const updatedPayment = { ...payment, ...updates };
    this.municipalPayments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Revenue Dashboard
  async getRevenueDashboard(): Promise<any> {
    const bills = Array.from(this.bills.values());
    const payments = Array.from(this.municipalPayments.values());
    const accounts = Array.from(this.billingAccounts.values());
    
    const totalBilled = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalOutstanding = totalBilled - totalCollected;
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;
    
    return {
      totalBilled,
      totalCollected,
      totalOutstanding,
      collectionRate,
      numberOfAccounts: accounts.length,
      numberOfBills: bills.length,
      numberOfPayments: payments.length
    };
  }

  async getRevenueReports(filters: any): Promise<any[]> {
    return Array.from(this.revenueReports.values()).filter(report => {
      if (filters.reportType && report.reportType !== filters.reportType) return false;
      if (filters.period && report.reportPeriod !== filters.period) return false;
      if (filters.serviceType && report.serviceType !== filters.serviceType) return false;
      return true;
    });
  }

  async generateRevenueReport(reportData: any): Promise<any> {
    const id = this.currentRevenueReportId++;
    const report = {
      ...reportData,
      id,
      generatedAt: new Date()
    };
    this.revenueReports.set(id, report);
    return report;
  }

  // Payment Plans
  async getPaymentPlans(accountId?: number, status?: string): Promise<any[]> {
    let plans = Array.from(this.paymentPlans.values());
    
    if (accountId) {
      plans = plans.filter(plan => plan.accountId === accountId);
    }
    if (status) {
      plans = plans.filter(plan => plan.status === status);
    }
    
    return plans;
  }

  async createPaymentPlan(plan: any): Promise<any> {
    const id = this.currentPaymentPlanId++;
    const newPlan = {
      ...plan,
      id,
      planNumber: plan.planNumber || `PLAN-${Date.now()}`,
      status: plan.status || "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.paymentPlans.set(id, newPlan);
    return newPlan;
  }

  async updatePaymentPlan(id: number, updates: any): Promise<any | undefined> {
    const plan = this.paymentPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates, updatedAt: new Date() };
    this.paymentPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  // Tariff Structures
  async getTariffStructures(serviceType?: string, customerCategory?: string): Promise<any[]> {
    let tariffs = Array.from(this.tariffStructures.values());
    
    if (serviceType) {
      tariffs = tariffs.filter(tariff => tariff.serviceType === serviceType);
    }
    if (customerCategory) {
      tariffs = tariffs.filter(tariff => tariff.customerCategory === customerCategory);
    }
    
    return tariffs;
  }

  // Collection Summary
  async getCollectionSummary(period: string, serviceType?: string): Promise<any> {
    const payments = Array.from(this.municipalPayments.values());
    const bills = Array.from(this.bills.values());
    
    let filteredPayments = payments;
    let filteredBills = bills;
    
    if (serviceType) {
      const serviceTypeBills = bills.filter(bill => bill.serviceType === serviceType);
      const billIds = serviceTypeBills.map(bill => bill.id);
      filteredPayments = payments.filter(payment => payment.billId && billIds.includes(payment.billId));
      filteredBills = serviceTypeBills;
    }
    
    const totalCollected = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalBilled = filteredBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;
    
    return {
      period,
      serviceType,
      totalCollected,
      totalBilled,
      collectionRate,
      numberOfPayments: filteredPayments.length,
      numberOfBills: filteredBills.length
    };
  }
}

export const storage = new MemStorage();
