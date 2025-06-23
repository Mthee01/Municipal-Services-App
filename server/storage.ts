import { 
  users, issues, payments, teams, technicians, wards, issueUpdates, vouchers,
  fieldReports, partsInventory, partsOrders, technicianMessages, technicianLocations,
  chatMessages, whatsappMessages, whatsappConversations,
  type User, type InsertUser, type Issue, type InsertIssue, 
  type Payment, type InsertPayment, type Team, type InsertTeam,
  type Technician, type InsertTechnician, type Ward, type InsertWard,
  type IssueUpdate, type InsertIssueUpdate, type Voucher, type InsertVoucher,
  type FieldReport, type InsertFieldReport, type PartsInventory, type InsertPartsInventory,
  type PartsOrder, type InsertPartsOrder, type TechnicianMessage, type InsertTechnicianMessage,
  type TechnicianLocation, type InsertTechnicianLocation, type ChatMessage, type InsertChatMessage,
  type WhatsappMessage, type InsertWhatsappMessage, type WhatsappConversation, type InsertWhatsappConversation
} from "@shared/schema";

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

  // Field report operations
  getFieldReports(): Promise<FieldReport[]>;
  getFieldReport(id: number): Promise<FieldReport | undefined>;
  getFieldReportsByTechnician(technicianId: number): Promise<FieldReport[]>;
  getFieldReportsByIssue(issueId: number): Promise<FieldReport[]>;
  createFieldReport(report: InsertFieldReport): Promise<FieldReport>;
  updateFieldReport(id: number, updates: Partial<FieldReport>): Promise<FieldReport | undefined>;

  // Parts inventory operations
  getPartsInventory(): Promise<PartsInventory[]>;
  getPartsInventoryItem(id: number): Promise<PartsInventory | undefined>;
  getPartsInventoryByCategory(category: string): Promise<PartsInventory[]>;
  createPartsInventoryItem(item: InsertPartsInventory): Promise<PartsInventory>;
  updatePartsInventoryItem(id: number, updates: Partial<PartsInventory>): Promise<PartsInventory | undefined>;

  // Parts order operations
  getPartsOrders(): Promise<PartsOrder[]>;
  getPartsOrder(id: number): Promise<PartsOrder | undefined>;
  getPartsOrdersByTechnician(technicianId: number): Promise<PartsOrder[]>;
  getPartsOrdersByStatus(status: string): Promise<PartsOrder[]>;
  createPartsOrder(order: InsertPartsOrder): Promise<PartsOrder>;
  updatePartsOrder(id: number, updates: Partial<PartsOrder>): Promise<PartsOrder | undefined>;

  // Technician message operations
  getTechnicianMessages(): Promise<TechnicianMessage[]>;
  getTechnicianMessage(id: number): Promise<TechnicianMessage | undefined>;
  getTechnicianMessagesByUser(userId: number): Promise<TechnicianMessage[]>;
  getTechnicianMessagesBetweenUsers(fromUserId: number, toUserId: number): Promise<TechnicianMessage[]>;
  createTechnicianMessage(message: InsertTechnicianMessage): Promise<TechnicianMessage>;
  updateTechnicianMessage(id: number, updates: Partial<TechnicianMessage>): Promise<TechnicianMessage | undefined>;

  // Technician location operations
  getTechnicianLocations(): Promise<TechnicianLocation[]>;
  getTechnicianLocation(id: number): Promise<TechnicianLocation | undefined>;
  getTechnicianLocationsByTechnician(technicianId: number): Promise<TechnicianLocation[]>;
  createTechnicianLocation(location: InsertTechnicianLocation): Promise<TechnicianLocation>;
  getLatestTechnicianLocation(technicianId: number): Promise<TechnicianLocation | undefined>;

  // Chat message operations
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // WhatsApp message operations
  getWhatsappMessages(phoneNumber?: string): Promise<WhatsappMessage[]>;
  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
  updateWhatsappMessageStatus(messageId: string, status: string): Promise<boolean>;

  // Active work sessions operations
  getActiveWorkSessions(): Promise<{ issueId: number; arrivalTime: Date; isActive: boolean }[]>;
  
  // Analytics operations
  getWardStats(wardNumber?: string): Promise<any>;
  getTechnicianPerformance(): Promise<any>;
  getMunicipalityStats(): Promise<any>;
  getDepartmentStats(department?: string): Promise<any>;
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
  private fieldReports: Map<number, FieldReport>;
  private partsInventory: Map<number, PartsInventory>;
  private partsOrders: Map<number, PartsOrder>;
  private technicianMessages: Map<number, TechnicianMessage>;
  private technicianLocations: Map<number, TechnicianLocation>;
  private chatMessagesStore: Map<number, ChatMessage>;
  private whatsappMessagesStore: Map<number, WhatsappMessage>;
  private whatsappConversationsStore: Map<number, WhatsappConversation>;
  private activeWorkSessions: Map<number, { issueId: number; arrivalTime: Date; isActive: boolean }>;
  private currentUserId: number;
  private currentIssueId: number;
  private currentPaymentId: number;
  private currentTeamId: number;
  private currentTechnicianId: number;
  private currentWardId: number;
  private currentIssueUpdateId: number;
  private currentVoucherId: number;
  private currentFieldReportId: number;
  private currentPartsInventoryId: number;
  private currentPartsOrderId: number;
  private currentTechnicianMessageId: number;
  private currentTechnicianLocationId: number;
  private currentChatMessageId: number;
  private currentWhatsappMessageId: number;
  private currentWhatsappConversationId: number;

  constructor() {
    this.users = new Map();
    this.issues = new Map();
    this.payments = new Map();
    this.teams = new Map();
    this.technicians = new Map();
    this.wards = new Map();
    this.issueUpdates = new Map();
    this.vouchers = new Map();
    this.fieldReports = new Map();
    this.partsInventory = new Map();
    this.partsOrders = new Map();
    this.technicianMessages = new Map();
    this.technicianLocations = new Map();
    this.chatMessagesStore = new Map();
    this.whatsappMessagesStore = new Map();
    this.activeWorkSessions = new Map();
    this.currentUserId = 1;
    this.currentIssueId = 1;
    this.currentPaymentId = 1;
    this.currentTeamId = 1;
    this.currentTechnicianId = 1;
    this.currentWardId = 1;
    this.currentIssueUpdateId = 1;
    this.currentVoucherId = 1;
    this.currentFieldReportId = 1;
    this.currentPartsInventoryId = 1;
    this.currentPartsOrderId = 1;
    this.currentTechnicianMessageId = 1;
    this.currentTechnicianLocationId = 1;
    this.currentChatMessageId = 1;
    this.currentWhatsappMessageId = 1;

    this.seedData();
    this.seedFieldTechnicianData();
  }

  private seedData() {
    // Seed demo users for testing
    const sampleUsers: User[] = [
      {
        id: this.currentUserId++,
        username: "citizen",
        password: "password",
        name: "John Citizen",
        email: "citizen@test.com",
        phone: "0821234567",
        role: "citizen",
        municipalityAccountNo: "MC001234",
      },
      {
        id: this.currentUserId++,
        username: "agent",
        password: "password",
        name: "Sarah Agent",
        email: "agent@municipality.gov.za",
        phone: "0827654321",
        role: "call_centre_agent",
        municipalityAccountNo: null,
      },
      {
        id: this.currentUserId++,
        username: "mayor",
        password: "password",
        name: "Mayor Thompson",
        email: "mayor@municipality.gov.za",
        phone: "0823456789",
        role: "mayor",
        municipalityAccountNo: null,
      },
      {
        id: this.currentUserId++,
        username: "councillor",
        password: "password",
        name: "Ward Councillor Smith",
        email: "councillor@municipality.gov.za",
        phone: "0829876543",
        role: "ward_councillor",
        municipalityAccountNo: null,
      },
      {
        id: this.currentUserId++,
        username: "techmanager",
        password: "password",
        name: "Tech Manager Jones",
        email: "techmanager@municipality.gov.za",
        phone: "0825678901",
        role: "tech_manager",
        municipalityAccountNo: null,
      },
      {
        id: this.currentUserId++,
        username: "technician",
        password: "password",
        name: "Field Technician Wilson",
        email: "technician@municipality.gov.za",
        phone: "0824567890",
        role: "field_technician",
        municipalityAccountNo: null,
      },
      {
        id: this.currentUserId++,
        username: "admin",
        password: "password",
        name: "System Administrator",
        email: "admin@municipality.gov.za",
        phone: "0820123456",
        role: "admin",
        municipalityAccountNo: null,
      },
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

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
        status: "resolved",
        location: "Corner of Oak and Pine Streets",
        ward: "Ward 1",
        reporterName: "Peter Jones",
        reporterPhone: "0835551234",
        assignedTo: "Electricity Repair Team C",
        photos: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        rating: 5,
        feedback: "Fixed quickly and professionally. Thank you!",
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
        status: "resolved",
        location: "Valley Road near the bridge",
        ward: "Ward 1",
        reporterName: "Michael Davis",
        reporterPhone: "0812223333",
        assignedTo: "Water Maintenance Team A",
        photos: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        rating: 4,
        feedback: "Drain cleared efficiently. Water flows properly now.",
      },
      {
        id: this.currentIssueId++,
        title: "Water pipe repair in progress",
        description: "Main water line burst on Main Street. Repair work has started and is currently in progress.",
        category: "water_sanitation",
        priority: "high",
        status: "in_progress",
        location: "Main Street, near traffic lights",
        ward: "Ward 1",
        reporterName: "City Inspector",
        reporterPhone: "0821234567",
        assignedTo: "1",
        photos: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        resolvedAt: null,
        rating: null,
        feedback: null,
      },
      {
        id: this.currentIssueId++,
        title: "Power outage repair ongoing",
        description: "Transformer failure affecting 50 households. Technician is currently working on restoration.",
        category: "electricity",
        priority: "emergency",
        status: "in_progress",
        location: "Residential Area Block C",
        ward: "Ward 3",
        reporterName: "Emergency Services",
        reporterPhone: "0827654321",
        assignedTo: "1",
        photos: null,
        createdAt: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        updatedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
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
        status: "on_job",
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
        status: "on_job", 
        currentLocation: "Electrical Depot",
        latitude: "-25.7544",
        longitude: "28.1777",
        teamId: 3,
        performanceRating: 4,
        completedIssues: 22,
        avgResolutionTime: 16,
        lastUpdate: new Date(),
      },
      {
        id: this.currentTechnicianId++,
        name: "James Williams",
        phone: "0833445566",
        email: "j.williams@municipality.gov.za",
        department: "Safety & Security",
        skills: ["Public Safety", "Equipment Inspection", "Emergency Response"],
        status: "available",
        currentLocation: "Security Office",
        latitude: "-25.7488",
        longitude: "28.1855",
        teamId: 4,
        performanceRating: 4,
        completedIssues: 18,
        avgResolutionTime: 8,
        lastUpdate: new Date(),
      },
      {
        id: this.currentTechnicianId++,
        name: "Angela Davis",
        phone: "0821556677",
        email: "a.davis@municipality.gov.za",
        department: "Safety & Security",
        skills: ["Playground Safety", "Public Facilities", "Risk Assessment"],
        status: "available",
        currentLocation: "Municipal Park Office",
        latitude: "-25.7401",
        longitude: "28.1922",
        teamId: 4,
        performanceRating: 5,
        completedIssues: 25,
        avgResolutionTime: 6,
        lastUpdate: new Date(),
      },
    ];

    sampleTechnicians.forEach(technician => this.technicians.set(technician.id, technician));
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

    const categoryStats: any = {};
    wardIssues.forEach(issue => {
      categoryStats[issue.category] = (categoryStats[issue.category] || 0) + 1;
    });

    const priorityStats: any = {};
    wardIssues.forEach(issue => {
      priorityStats[issue.priority] = (priorityStats[issue.priority] || 0) + 1;
    });

    // Get technicians working on ward issues
    const allTechnicians = Array.from(this.technicians.values());
    const wardTechnicians = allTechnicians.filter(tech => 
      wardIssues.some(issue => issue.assignedTo && issue.assignedTo.includes(tech.name))
    );

    // Calculate ward technician performance
    const avgTechPerformance = wardTechnicians.length > 0 
      ? wardTechnicians.reduce((acc, tech) => acc + (tech.performanceRating || 0), 0) / wardTechnicians.length
      : 0;

    const avgTechResolutionTime = wardTechnicians.length > 0 
      ? wardTechnicians.reduce((acc, tech) => acc + (tech.avgResolutionTime || 0), 0) / wardTechnicians.length
      : 0;

    const totalTechCompletedIssues = wardTechnicians.reduce((acc, tech) => acc + (tech.completedIssues || 0), 0);

    return {
      totalIssues,
      openIssues,
      inProgress,
      resolved,
      resolutionRate: totalIssues > 0 ? (resolved / totalIssues * 100) : 0,
      avgRating: Math.round(avgRating * 10) / 10,
      categoryStats,
      priorityStats,
      // Technician performance metrics
      activeTechnicians: wardTechnicians.length,
      avgTechPerformance: Math.round(avgTechPerformance * 10) / 10,
      avgTechResolutionTime: Math.round(avgTechResolutionTime * 10) / 10,
      totalTechCompletedIssues,
      technicianDetails: wardTechnicians.map(tech => ({
        id: tech.id,
        name: tech.name,
        status: tech.status,
        performanceRating: tech.performanceRating,
        completedIssues: tech.completedIssues,
        avgResolutionTime: tech.avgResolutionTime,
        department: tech.department
      }))
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
    const completedIssues = departmentTechnicians.reduce((acc, t) => acc + (t.completedIssues || 0), 0);

    return {
      department: department || "All Departments",
      totalTechnicians,
      availableTechnicians,
      onJobTechnicians,
      totalIssues,
      completedIssues,
      avgPerformance: departmentTechnicians.length > 0 
        ? departmentTechnicians.reduce((acc, t) => acc + (t.performanceRating || 0), 0) / departmentTechnicians.length 
        : 0,
      avgResolutionTime: departmentTechnicians.length > 0
        ? departmentTechnicians.reduce((acc, t) => acc + (t.avgResolutionTime || 0), 0) / departmentTechnicians.length
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
      purchaseDate: new Date(),
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

  // Field Report methods
  async getFieldReports(): Promise<FieldReport[]> {
    return Array.from(this.fieldReports.values());
  }

  async getFieldReport(id: number): Promise<FieldReport | undefined> {
    return this.fieldReports.get(id);
  }

  async getFieldReportsByTechnician(technicianId: number): Promise<FieldReport[]> {
    return Array.from(this.fieldReports.values()).filter(r => r.technicianId === technicianId);
  }

  async getFieldReportsByIssue(issueId: number): Promise<FieldReport[]> {
    return Array.from(this.fieldReports.values()).filter(r => r.issueId === issueId);
  }

  async createFieldReport(insertReport: InsertFieldReport): Promise<FieldReport> {
    const id = this.currentFieldReportId++;
    const report: FieldReport = {
      ...insertReport,
      id,
      createdAt: new Date(),
    };
    this.fieldReports.set(id, report);
    return report;
  }

  async updateFieldReport(id: number, updates: Partial<FieldReport>): Promise<FieldReport | undefined> {
    const report = this.fieldReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: FieldReport = { ...report, ...updates };
    this.fieldReports.set(id, updatedReport);
    return updatedReport;
  }

  // Parts Inventory methods
  async getPartsInventory(): Promise<PartsInventory[]> {
    return Array.from(this.partsInventory.values());
  }

  async getPartsInventoryItem(id: number): Promise<PartsInventory | undefined> {
    return this.partsInventory.get(id);
  }

  async getPartsInventoryByCategory(category: string): Promise<PartsInventory[]> {
    return Array.from(this.partsInventory.values()).filter(p => p.category === category);
  }

  async createPartsInventoryItem(insertItem: InsertPartsInventory): Promise<PartsInventory> {
    const id = this.currentPartsInventoryId++;
    const item: PartsInventory = {
      ...insertItem,
      id,
      lastUpdated: new Date(),
    };
    this.partsInventory.set(id, item);
    return item;
  }

  async updatePartsInventoryItem(id: number, updates: Partial<PartsInventory>): Promise<PartsInventory | undefined> {
    const item = this.partsInventory.get(id);
    if (!item) return undefined;
    
    const updatedItem: PartsInventory = { 
      ...item, 
      ...updates,
      lastUpdated: new Date()
    };
    this.partsInventory.set(id, updatedItem);
    return updatedItem;
  }

  // Parts Order methods
  async getPartsOrders(): Promise<PartsOrder[]> {
    return Array.from(this.partsOrders.values());
  }

  async getPartsOrder(id: number): Promise<PartsOrder | undefined> {
    return this.partsOrders.get(id);
  }

  async getPartsOrdersByTechnician(technicianId: number): Promise<PartsOrder[]> {
    return Array.from(this.partsOrders.values()).filter(o => o.technicianId === technicianId);
  }

  async getPartsOrdersByStatus(status: string): Promise<PartsOrder[]> {
    return Array.from(this.partsOrders.values()).filter(o => o.status === status);
  }

  async createPartsOrder(insertOrder: InsertPartsOrder): Promise<PartsOrder> {
    const id = this.currentPartsOrderId++;
    const order: PartsOrder = {
      ...insertOrder,
      id,
      orderDate: new Date(),
    };
    this.partsOrders.set(id, order);
    return order;
  }

  async updatePartsOrder(id: number, updates: Partial<PartsOrder>): Promise<PartsOrder | undefined> {
    const order = this.partsOrders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: PartsOrder = { ...order, ...updates };
    this.partsOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Technician Message methods
  async getTechnicianMessages(): Promise<TechnicianMessage[]> {
    return Array.from(this.technicianMessages.values());
  }

  async getTechnicianMessage(id: number): Promise<TechnicianMessage | undefined> {
    return this.technicianMessages.get(id);
  }

  async getTechnicianMessagesByUser(userId: number): Promise<TechnicianMessage[]> {
    return Array.from(this.technicianMessages.values()).filter(m => 
      m.fromUserId === userId || m.toUserId === userId
    );
  }

  async getTechnicianMessagesBetweenUsers(fromUserId: number, toUserId: number): Promise<TechnicianMessage[]> {
    return Array.from(this.technicianMessages.values()).filter(m => 
      (m.fromUserId === fromUserId && m.toUserId === toUserId) ||
      (m.fromUserId === toUserId && m.toUserId === fromUserId)
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  async createTechnicianMessage(insertMessage: InsertTechnicianMessage): Promise<TechnicianMessage> {
    const id = this.currentTechnicianMessageId++;
    const message: TechnicianMessage = {
      ...insertMessage,
      id,
      sentAt: new Date(),
    };
    this.technicianMessages.set(id, message);
    return message;
  }

  async updateTechnicianMessage(id: number, updates: Partial<TechnicianMessage>): Promise<TechnicianMessage | undefined> {
    const message = this.technicianMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage: TechnicianMessage = { ...message, ...updates };
    this.technicianMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Technician Location methods
  async getTechnicianLocations(): Promise<TechnicianLocation[]> {
    return Array.from(this.technicianLocations.values());
  }

  async getTechnicianLocation(id: number): Promise<TechnicianLocation | undefined> {
    return this.technicianLocations.get(id);
  }

  async getTechnicianLocationsByTechnician(technicianId: number): Promise<TechnicianLocation[]> {
    return Array.from(this.technicianLocations.values())
      .filter(l => l.technicianId === technicianId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createTechnicianLocation(insertLocation: InsertTechnicianLocation): Promise<TechnicianLocation> {
    const id = this.currentTechnicianLocationId++;
    const location: TechnicianLocation = {
      ...insertLocation,
      id,
      timestamp: new Date(),
    };
    this.technicianLocations.set(id, location);
    return location;
  }

  async getLatestTechnicianLocation(technicianId: number): Promise<TechnicianLocation | undefined> {
    const locations = await this.getTechnicianLocationsByTechnician(technicianId);
    return locations[0]; // Already sorted by timestamp desc
  }

  private seedFieldTechnicianData() {
    // Seed parts inventory
    const inventoryItems = [
      { 
        id: 1, 
        partName: 'Water Pipe 25mm', 
        partNumber: 'WP-25MM-001',
        description: 'Standard 25mm water pipe for municipal repairs',
        category: 'Plumbing', 
        stockQuantity: 50, 
        minimumStock: 10, 
        unitPrice: 15.50, 
        supplier: 'PlumbCorp', 
        createdAt: new Date(),
        lastOrderDate: null
      },
      { 
        id: 2, 
        partName: 'Electrical Cable 2.5mm', 
        partNumber: 'EC-2.5MM-001',
        description: 'Electrical cable for street lighting repairs',
        category: 'Electrical', 
        stockQuantity: 100, 
        minimumStock: 20, 
        unitPrice: 3.25, 
        supplier: 'ElectroSupply', 
        createdAt: new Date(),
        lastOrderDate: null
      },
      { 
        id: 3, 
        partName: 'Concrete Mix 25kg', 
        partNumber: 'CM-25KG-001',
        description: 'Quick-set concrete mix for road repairs',
        category: 'Construction', 
        stockQuantity: 30, 
        minimumStock: 5, 
        unitPrice: 8.75, 
        supplier: 'BuildMaterials', 
        createdAt: new Date(),
        lastOrderDate: null
      },
      { 
        id: 4, 
        partName: 'Road Patch Kit', 
        partNumber: 'RPK-001',
        description: 'Complete road patching kit for pothole repairs',
        category: 'Roads', 
        stockQuantity: 15, 
        minimumStock: 3, 
        unitPrice: 45.00, 
        supplier: 'RoadFix', 
        createdAt: new Date(),
        lastOrderDate: null
      },
      { 
        id: 5, 
        partName: 'LED Street Light', 
        partNumber: 'LSL-001',
        description: 'Energy-efficient LED street light fixture',
        category: 'Lighting', 
        stockQuantity: 25, 
        minimumStock: 5, 
        unitPrice: 120.00, 
        supplier: 'LightTech', 
        createdAt: new Date(),
        lastOrderDate: null
      }
    ];

    inventoryItems.forEach(item => {
      this.partsInventory.set(item.id, item);
    });
    this.currentPartsInventoryId = 6;

    // Seed field reports  
    const reports = [
      {
        id: 1,
        issueId: 1,
        technicianId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        arrivalTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        departureTime: null,
        travelTimeMinutes: 15,
        workDescription: 'Assessed water pipe damage, requires replacement of 5m section',
        materialsUsed: ['Water Pipe 25mm', 'Pipe Fittings'],
        photoUrls: ['/uploads/pipe-damage-1.jpg'],
        status: 'in_progress',
        findings: 'Pipe corroded beyond repair, affecting water pressure in area',
        recommendations: 'Schedule pipe replacement for tomorrow morning',
        followUpRequired: true,
        nextVisitDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        issueId: 2,
        technicianId: 1,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() - 26 * 60 * 60 * 1000),
        departureTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        travelTimeMinutes: 12,
        workDescription: 'Street light repair completed successfully',
        materialsUsed: ['LED Driver Unit', 'Electrical Wire'],
        photoUrls: ['/uploads/streetlight-fixed-1.jpg'],
        status: 'completed',
        findings: 'Faulty LED driver was causing intermittent operation',
        recommendations: 'Monitor operation for 48 hours',
        followUpRequired: false,
        nextVisitDate: null
      }
    ];

    reports.forEach(report => {
      this.fieldReports.set(report.id, report);
    });
    this.currentFieldReportId = 3;

    // Seed parts orders
    const orders = [
      {
        id: 1,
        orderNumber: 'PO-2024-001',
        technicianId: 1,
        issueId: 1,
        fieldReportId: 1,
        partName: 'Hydraulic Valve 50mm',
        partNumber: 'HV-50MM-001',
        quantity: 2,
        unitPrice: 125.00,
        totalPrice: 250.00,
        priority: 'high',
        status: 'pending',
        justification: 'Required for emergency water main repair',
        createdAt: new Date(),
        updatedAt: new Date(),
        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        deliveryLocation: 'Oak Street Site'
      },
      {
        id: 2,
        orderNumber: 'PO-2024-002',
        technicianId: 1,
        issueId: 2,
        fieldReportId: null,
        partName: 'Asphalt Cold Mix 25kg',
        partNumber: 'ACM-25KG-001',
        quantity: 5,
        unitPrice: 15.00,
        totalPrice: 75.00,
        priority: 'medium',
        status: 'approved',
        justification: 'Pothole repairs in Ward 3',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        deliveryLocation: 'Pine Avenue Site'
      }
    ];

    orders.forEach(order => {
      this.partsOrders.set(order.id, order);
    });
    this.currentPartsOrderId = 3;

    // Seed technician messages
    const messages = [
      {
        id: 1,
        fromUserId: 2, // Technical Manager
        toUserId: 1,   // Field Technician
        issueId: 1,
        fieldReportId: null,
        subject: 'Priority Assignment Update',
        message: 'Please prioritize the water main issue on Oak Street. Residents are without water since this morning.',
        messageType: 'urgent',
        priority: 'high',
        attachments: null,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        id: 2,
        fromUserId: 1, // Field Technician
        toUserId: 2,   // Technical Manager
        issueId: 1,
        fieldReportId: 1,
        subject: 'Parts Request - Hydraulic Valve',
        message: 'Need urgent approval for hydraulic valve order. Current valve is completely failed.',
        messageType: 'help_request',
        priority: 'high',
        attachments: null,
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        readAt: null
      },
      {
        id: 3,
        fromUserId: 3, // Call Center Agent
        toUserId: 1,   // Field Technician
        issueId: 2,
        fieldReportId: null,
        subject: 'Citizen Feedback',
        message: 'Received positive feedback about your street light repairs. Great work!',
        messageType: 'general',
        priority: 'low',
        attachments: null,
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    messages.forEach(message => {
      this.technicianMessages.set(message.id, message);
    });
    this.currentTechnicianMessageId = 4;

    // Seed technician locations
    const locations = [
      {
        id: 1,
        technicianId: 1,
        latitude: '-26.2041',
        longitude: '28.0473',
        address: 'Oak Street, Johannesburg',
        isOnSite: true,
        currentIssueId: 1,
        speed: null,
        heading: null,
        accuracy: 5,
        timestamp: new Date()
      },
      {
        id: 2,
        technicianId: 1,
        latitude: '-26.2055',
        longitude: '28.0485',
        address: 'Pine Avenue, Johannesburg',
        isOnSite: false,
        currentIssueId: null,
        speed: 25,
        heading: 180,
        accuracy: 3,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      }
    ];

    locations.forEach(location => {
      this.technicianLocations.set(location.id, location);
    });
    this.currentTechnicianLocationId = 3;

    // Add active work sessions for in-progress issues (issues 5 and 6)
    this.activeWorkSessions.set(5, {
      issueId: 5,
      arrivalTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
      isActive: true
    });

    this.activeWorkSessions.set(6, {
      issueId: 6,
      arrivalTime: new Date(Date.now() - 90 * 60 * 1000), // Started 1.5 hours ago
      isActive: true
    });
  }

  // Active work sessions operations
  async getActiveWorkSessions(): Promise<{ issueId: number; arrivalTime: Date; isActive: boolean }[]> {
    return Array.from(this.activeWorkSessions.values());
  }

  // Chat message operations
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessagesStore.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: this.currentChatMessageId++,
      ...message,
      timestamp: new Date(),
    };
    this.chatMessagesStore.set(chatMessage.id, chatMessage);
    return chatMessage;
  }

  // WhatsApp message operations
  async getWhatsappMessages(phoneNumber?: string): Promise<WhatsappMessage[]> {
    const messages = Array.from(this.whatsappMessagesStore.values());
    if (phoneNumber) {
      return messages.filter(message => message.phoneNumber === phoneNumber)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const whatsappMessage: WhatsappMessage = {
      id: this.currentWhatsappMessageId++,
      ...message,
      timestamp: new Date(),
    };
    this.whatsappMessagesStore.set(whatsappMessage.id, whatsappMessage);
    return whatsappMessage;
  }

  async updateWhatsappMessageStatus(messageId: string, status: string): Promise<boolean> {
    for (const message of this.whatsappMessagesStore.values()) {
      if (message.messageId === messageId) {
        message.status = status;
        return true;
      }
    }
    return false;
  }

  // WhatsApp Conversations
  async getWhatsappConversations(): Promise<WhatsappConversation[]> {
    return Array.from(this.whatsappConversationsStore.values());
  }

  async createWhatsappConversation(conversation: InsertWhatsappConversation): Promise<WhatsappConversation> {
    const newConversation: WhatsappConversation = {
      id: this.currentWhatsappConversationId++,
      ...conversation,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.whatsappConversationsStore.set(newConversation.id, newConversation);
    return newConversation;
  }

  async getWhatsappMessagesByConversation(citizenId: number): Promise<WhatsappMessage[]> {
    return Array.from(this.whatsappMessagesStore.values())
      .filter(msg => msg.userId === citizenId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async updateWhatsappConversationStatus(conversationId: number, status: string, agentId?: number): Promise<void> {
    const conversation = this.whatsappConversationsStore.get(conversationId);
    if (conversation) {
      conversation.status = status;
      conversation.updatedAt = new Date();
      if (agentId) conversation.agentId = agentId;
      if (status === 'closed') conversation.closedAt = new Date();
    }
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Issue operations
  async getIssues(): Promise<Issue[]> {
    return await db.select().from(issues);
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue || undefined;
  }

  async getIssuesByStatus(status: string): Promise<Issue[]> {
    return await db.select().from(issues).where(eq(issues.status, status));
  }

  async getIssuesByCategory(category: string): Promise<Issue[]> {
    return await db.select().from(issues).where(eq(issues.category, category));
  }

  async getIssuesByWard(ward: string): Promise<Issue[]> {
    return await db.select().from(issues).where(eq(issues.ward, ward));
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const [createdIssue] = await db
      .insert(issues)
      .values(issue)
      .returning();
    return createdIssue;
  }

  async updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined> {
    const [updatedIssue] = await db
      .update(issues)
      .set(updates)
      .where(eq(issues.id, id))
      .returning();
    return updatedIssue || undefined;
  }

  async deleteIssue(id: number): Promise<boolean> {
    const result = await db.delete(issues).where(eq(issues.id, id));
    return result.rowCount > 0;
  }

  // Payment operations
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByType(type: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.type, type));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [createdPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return createdPayment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment || undefined;
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getTeamsByDepartment(department: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.department, department));
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [createdTeam] = await db
      .insert(teams)
      .values(team)
      .returning();
    return createdTeam;
  }

  async updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam || undefined;
  }

  // Technician operations
  async getTechnicians(): Promise<Technician[]> {
    return await db.select().from(technicians);
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician || undefined;
  }

  async getTechniciansByDepartment(department: string): Promise<Technician[]> {
    return await db.select().from(technicians).where(eq(technicians.department, department));
  }

  async getTechniciansByStatus(status: string): Promise<Technician[]> {
    return await db.select().from(technicians).where(eq(technicians.status, status));
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const [createdTechnician] = await db
      .insert(technicians)
      .values(technician)
      .returning();
    return createdTechnician;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const [updatedTechnician] = await db
      .update(technicians)
      .set(updates)
      .where(eq(technicians.id, id))
      .returning();
    return updatedTechnician || undefined;
  }

  async assignTechnicianToIssue(technicianId: number, issueId: number): Promise<boolean> {
    try {
      const [technician] = await db.select().from(technicians).where(eq(technicians.id, technicianId));
      if (!technician) return false;

      await db
        .update(issues)
        .set({ assignedTo: technician.name })
        .where(eq(issues.id, issueId));

      await db
        .update(technicians)
        .set({ status: "on_job" })
        .where(eq(technicians.id, technicianId));

      return true;
    } catch (error) {
      return false;
    }
  }

  async getWards(): Promise<Ward[]> { return []; }
  async getWard(id: number): Promise<Ward | undefined> { return undefined; }
  async getWardByNumber(wardNumber: string): Promise<Ward | undefined> { return undefined; }
  async createWard(ward: InsertWard): Promise<Ward> { throw new Error("Not implemented"); }
  async updateWard(id: number, updates: Partial<Ward>): Promise<Ward | undefined> { return undefined; }

  async getIssueUpdates(issueId: number): Promise<IssueUpdate[]> { return []; }
  async createIssueUpdate(update: InsertIssueUpdate): Promise<IssueUpdate> { throw new Error("Not implemented"); }

  async getVouchers(): Promise<Voucher[]> { return []; }
  async getVoucher(id: number): Promise<Voucher | undefined> { return undefined; }
  async getVouchersByType(type: string): Promise<Voucher[]> { return []; }
  async getVoucherByCode(code: string): Promise<Voucher | undefined> { return undefined; }
  async createVoucher(voucher: InsertVoucher): Promise<Voucher> { throw new Error("Not implemented"); }
  async updateVoucher(id: number, updates: Partial<Voucher>): Promise<Voucher | undefined> { return undefined; }
  async useVoucher(voucherCode: string): Promise<boolean> { return false; }

  async getFieldReports(): Promise<FieldReport[]> { return []; }
  async getFieldReport(id: number): Promise<FieldReport | undefined> { return undefined; }
  async getFieldReportsByTechnician(technicianId: number): Promise<FieldReport[]> { return []; }
  async getFieldReportsByIssue(issueId: number): Promise<FieldReport[]> { return []; }
  async createFieldReport(report: InsertFieldReport): Promise<FieldReport> { throw new Error("Not implemented"); }
  async updateFieldReport(id: number, updates: Partial<FieldReport>): Promise<FieldReport | undefined> { return undefined; }

  async getPartsInventory(): Promise<PartsInventory[]> { return []; }
  async getPartsInventoryItem(id: number): Promise<PartsInventory | undefined> { return undefined; }
  async getPartsInventoryByCategory(category: string): Promise<PartsInventory[]> { return []; }
  async createPartsInventoryItem(item: InsertPartsInventory): Promise<PartsInventory> { throw new Error("Not implemented"); }
  async updatePartsInventoryItem(id: number, updates: Partial<PartsInventory>): Promise<PartsInventory | undefined> { return undefined; }

  async getPartsOrders(): Promise<PartsOrder[]> { return []; }
  async getPartsOrder(id: number): Promise<PartsOrder | undefined> { return undefined; }
  async getPartsOrdersByTechnician(technicianId: number): Promise<PartsOrder[]> { return []; }
  async getPartsOrdersByStatus(status: string): Promise<PartsOrder[]> { return []; }
  async createPartsOrder(order: InsertPartsOrder): Promise<PartsOrder> { throw new Error("Not implemented"); }
  async updatePartsOrder(id: number, updates: Partial<PartsOrder>): Promise<PartsOrder | undefined> { return undefined; }

  async getTechnicianMessages(): Promise<TechnicianMessage[]> { return []; }
  async getTechnicianMessage(id: number): Promise<TechnicianMessage | undefined> { return undefined; }
  async getTechnicianMessagesByUser(userId: number): Promise<TechnicianMessage[]> { return []; }
  async getTechnicianMessagesBetweenUsers(fromUserId: number, toUserId: number): Promise<TechnicianMessage[]> { return []; }
  async createTechnicianMessage(message: InsertTechnicianMessage): Promise<TechnicianMessage> { throw new Error("Not implemented"); }
  async updateTechnicianMessage(id: number, updates: Partial<TechnicianMessage>): Promise<TechnicianMessage | undefined> { return undefined; }

  async getTechnicianLocations(): Promise<TechnicianLocation[]> { return []; }
  async getTechnicianLocation(id: number): Promise<TechnicianLocation | undefined> { return undefined; }
  async getTechnicianLocationsByTechnician(technicianId: number): Promise<TechnicianLocation[]> { return []; }
  async createTechnicianLocation(location: InsertTechnicianLocation): Promise<TechnicianLocation> { throw new Error("Not implemented"); }
  async getLatestTechnicianLocation(technicianId: number): Promise<TechnicianLocation | undefined> { return undefined; }

  async getActiveWorkSessions(): Promise<{ issueId: number; arrivalTime: Date; isActive: boolean }[]> { return []; }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> { return []; }
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> { throw new Error("Not implemented"); }

  async getWhatsappMessages(phoneNumber?: string): Promise<WhatsappMessage[]> { 
    const messages = await db.select().from(whatsappMessages).orderBy(whatsappMessages.timestamp);
    if (phoneNumber) {
      return messages.filter(msg => msg.phoneNumber === phoneNumber);
    }
    return messages;
  }
  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> { 
    const [result] = await db.insert(whatsappMessages).values(message).returning();
    return result;
  }
  async updateWhatsappMessageStatus(messageId: string, status: string): Promise<boolean> { return false; }
  
  async getWhatsappConversations(): Promise<WhatsappConversation[]> {
    const conversations = await db.select().from(whatsappConversations).orderBy(whatsappConversations.lastMessageAt);
    return conversations;
  }
  
  async createWhatsappConversation(conversation: InsertWhatsappConversation): Promise<WhatsappConversation> {
    const [result] = await db.insert(whatsappConversations).values(conversation).returning();
    return result;
  }
  
  async updateWhatsappConversationStatus(conversationId: number, status: string, agentId?: number): Promise<void> {
    const updates: any = { status, updatedAt: new Date() };
    if (agentId) updates.agentId = agentId;
    if (status === 'closed') updates.closedAt = new Date();
    
    await db.update(whatsappConversations)
      .set(updates)
      .where(eq(whatsappConversations.id, conversationId));
  }

  async getUnreadWhatsappCount(): Promise<number> {
    const messages = await db.select().from(whatsappMessages)
      .where(eq(whatsappMessages.direction, 'inbound'));
    
    // Count messages from citizens (inbound) that haven't been responded to
    const inboundMessages = messages.filter(msg => msg.direction === 'inbound');
    const outboundMessages = messages.filter(msg => msg.direction === 'outbound');
    
    // Simple logic: count inbound messages that don't have a corresponding outbound response
    // In a real implementation, you'd track read status more precisely
    const unreadCount = Math.max(0, inboundMessages.length - outboundMessages.length);
    
    return Math.min(unreadCount, 5); // Cap at 5 for demo purposes
  }

  async getWardStats(wardNumber?: string): Promise<any> { return {}; }
  async getTechnicianPerformance(): Promise<any> { return []; }
  async getMunicipalityStats(): Promise<any> { return {}; }
  async getDepartmentStats(department?: string): Promise<any> { return {}; }
}

export const storage = new DatabaseStorage();
