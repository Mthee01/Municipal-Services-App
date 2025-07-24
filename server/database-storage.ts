import { 
  users, issues, payments, teams, technicians, wards, issueUpdates, vouchers,
  fieldReports, partsInventory, partsOrders, technicianMessages, technicianLocations,
  chatMessages, whatsappMessages, whatsappConversations, issueNotes, issueEscalations,
  jobCards, jobOrders, completionReports,
  type User, type InsertUser, type Issue, type InsertIssue, 
  type Payment, type InsertPayment, type Team, type InsertTeam,
  type Technician, type InsertTechnician, type Ward, type InsertWard,
  type IssueUpdate, type InsertIssueUpdate, type Voucher, type InsertVoucher,
  type FieldReport, type InsertFieldReport, type PartsInventory, type InsertPartsInventory,
  type PartsOrder, type InsertPartsOrder, type TechnicianMessage, type InsertTechnicianMessage,
  type TechnicianLocation, type InsertTechnicianLocation, type ChatMessage, type InsertChatMessage,
  type WhatsappMessage, type InsertWhatsappMessage, type WhatsappConversation, type InsertWhatsappConversation,
  type IssueNote, type InsertIssueNote, type IssueEscalation, type InsertIssueEscalation,
  type JobCard, type InsertJobCard, type JobOrder, type InsertJobOrder, type CompletionReport, type InsertCompletionReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or, isNull } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if users already exist
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        console.log("Database already initialized");
        return;
      }

      console.log("Initializing database with sample data...");

      // Create sample users
      const sampleUsers = [
        { id: 1, username: "citizen", name: "John Citizen", email: "citizen@example.com", phone: "0821234567", role: "citizen" as const },
        { id: 2, username: "agent", name: "Sarah Agent", email: "agent@municipality.gov.za", phone: "0829876543", role: "call_centre_agent" as const },
        { id: 3, username: "mayor", name: "Mayor Thompson", email: "mayor@municipality.gov.za", phone: "0835551234", role: "mayor" as const },
        { id: 4, username: "councillor", name: "Councillor Smith", email: "councillor@municipality.gov.za", phone: "0847778901", role: "ward_councillor" as const },
        { id: 5, username: "techmanager", name: "Tech Manager Jones", email: "techmanager@municipality.gov.za", phone: "0820123456", role: "tech_manager" as const },
        { id: 6, username: "technician", name: "Field Tech Williams", email: "technician@municipality.gov.za", phone: "0833456789", role: "field_technician" as const },
        { id: 7, username: "admin", name: "Admin User", email: "admin@municipality.gov.za", phone: "0821112222", role: "admin" as const }
      ];

      for (const user of sampleUsers) {
        await db.insert(users).values({
          ...user,
          municipalityAccountNo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
        console.log(`Creating user: ${user.username} with ID: ${user.id}`);
      }

      // Create sample technicians
      const sampleTechnicians = [
        {
          id: 1,
          name: "Mike Johnson",
          phone: "0821234567",
          email: "m.johnson@municipality.gov.za",
          department: "Water & Sanitation",
          skills: ["Plumbing", "Water Systems", "Pipe Repair"],
          status: "on_job" as const,
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
          id: 2,
          name: "Sarah Wilson",
          phone: "0829876543",
          email: "s.wilson@municipality.gov.za",
          department: "Water & Sanitation",
          skills: ["Water Quality", "System Maintenance", "Emergency Response"],
          status: "available" as const,
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
          id: 8,
          name: "David Brown",
          phone: "0835551111",
          email: "d.brown@municipality.gov.za",
          department: "Roads & Transport",
          skills: ["Road Repair", "Asphalt Work", "Traffic Management"],
          status: "on_job" as const,
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
          id: 9,
          name: "Lisa Garcia",
          phone: "0847772222",
          email: "l.garcia@municipality.gov.za",
          department: "Roads & Transport",
          skills: ["Pothole Repair", "Road Marking", "Drainage"],
          status: "available" as const,
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
          id: 10,
          name: "John Smith",
          phone: "0823334444",
          email: "j.smith@municipality.gov.za",
          department: "Electricity",
          skills: ["Electrical Repair", "Street Lighting", "Power Systems"],
          status: "on_job" as const,
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
          id: 11,
          name: "Mary Johnson",
          phone: "0819995555",
          email: "m.johnson2@municipality.gov.za",
          department: "Electricity",
          skills: ["Generator Maintenance", "Emergency Power", "Electrical Safety"],
          status: "available" as const,
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
          id: 12,
          name: "James Williams",
          phone: "0833445566",
          email: "j.williams@municipality.gov.za",
          department: "Safety & Security",
          skills: ["Public Safety", "Equipment Inspection", "Emergency Response"],
          status: "available" as const,
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
          id: 13,
          name: "Angela Davis",
          phone: "0821556677",
          email: "a.davis@municipality.gov.za",
          department: "Safety & Security",
          skills: ["Playground Safety", "Public Facilities", "Risk Assessment"],
          status: "available" as const,
          currentLocation: "Municipal Park Office",
          latitude: "-25.7401",
          longitude: "28.1922",
          teamId: 4,
          performanceRating: 5,
          completedIssues: 25,
          avgResolutionTime: 6,
          lastUpdate: new Date(),
        }
      ];

      for (const tech of sampleTechnicians) {
        await db.insert(technicians).values(tech).onConflictDoNothing();
      }

      // Create sample issues
      const sampleIssues = [
        {
          id: 5,
          title: "Broken playground equipment",
          description: "Central Park Playground - Ward 2",
          category: "safety_security" as const,
          priority: "emergency" as const,
          status: "open" as const,
          location: "Central Park Playground",
          ward: "Ward 2",
          reportedBy: 1,
          assignedTo: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(),
          resolvedAt: null,
          estimatedResolution: null,
          actualResolution: null,
          citizenSatisfaction: null,
          costEstimate: null,
          imageUrl: null
        }
      ];

      for (const issue of sampleIssues) {
        await db.insert(issues).values(issue).onConflictDoNothing();
      }

      console.log("Database initialization completed");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      status: status as any,
      lastActive: new Date(),
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      password: newPassword,
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }

  // Issue operations
  async getIssues(): Promise<Issue[]> {
    return db.select().from(issues).orderBy(desc(issues.createdAt));
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue;
  }

  async getIssuesByStatus(status: string): Promise<Issue[]> {
    return db.select().from(issues).where(eq(issues.status, status as any));
  }

  async getIssuesByCategory(category: string): Promise<Issue[]> {
    return db.select().from(issues).where(eq(issues.category, category as any));
  }

  async getIssuesByWard(ward: string): Promise<Issue[]> {
    return db.select().from(issues).where(eq(issues.ward, ward));
  }

  async getIssuesByTechnician(technicianId: number): Promise<Issue[]> {
    return db.select().from(issues).where(eq(issues.assignedTo, technicianId));
  }

  private generateReferenceNumber(): string {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return randomPart.padEnd(6, '0').substring(0, 6);
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const referenceNumber = this.generateReferenceNumber();
    const [issue] = await db.insert(issues).values({
      ...insertIssue,
      referenceNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return issue;
  }

  async updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined> {
    const [issue] = await db.update(issues).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(issues.id, id)).returning();
    return issue;
  }

  async deleteIssue(id: number): Promise<boolean> {
    const result = await db.delete(issues).where(eq(issues.id, id));
    return result.rowCount > 0;
  }

  // Issue Notes operations - CRITICAL FOR PERSISTENCE
  async getIssueNotes(issueId: number): Promise<IssueNote[]> {
    return db.select().from(issueNotes)
      .where(eq(issueNotes.issueId, issueId))
      .orderBy(desc(issueNotes.createdAt));
  }

  async createIssueNote(insertNote: InsertIssueNote): Promise<IssueNote> {
    const [note] = await db.insert(issueNotes).values({
      ...insertNote,
      createdAt: new Date()
    }).returning();
    return note;
  }

  // Issue Escalations operations - CRITICAL FOR PERSISTENCE
  async getIssueEscalations(issueId: number): Promise<IssueEscalation[]> {
    const result = await db.select().from(issueEscalations)
      .where(eq(issueEscalations.issueId, issueId))
      .orderBy(desc(issueEscalations.createdAt));
    
    // Transform database fields to match frontend expectations
    return result.map(row => ({
      id: row.id,
      issueId: row.issueId,
      escalatedBy: row.escalatedBy,
      escalatedTo: 'Technical Manager', // Default escalation target
      reason: row.escalationReason,
      priority: row.priority,
      escalatedAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      status: 'pending' as const,
      acknowledgedAt: null,
      resolvedAt: null,
      escalatedByRole: row.escalatedByRole
    }));
  }

  async createIssueEscalation(insertEscalation: InsertIssueEscalation): Promise<IssueEscalation> {
    const [escalation] = await db.insert(issueEscalations).values({
      issueId: insertEscalation.issueId,
      escalationReason: insertEscalation.escalationReason,
      escalatedBy: insertEscalation.escalatedBy,
      escalatedByRole: insertEscalation.escalatedByRole,
      priority: insertEscalation.priority || "urgent",
      createdAt: new Date()
    }).returning();
    return escalation;
  }

  // Technician operations
  async getTechnicians(): Promise<Technician[]> {
    return db.select().from(technicians);
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician;
  }

  async getTechniciansByDepartment(department: string): Promise<Technician[]> {
    return db.select().from(technicians).where(eq(technicians.department, department));
  }

  async getTechniciansByStatus(status: string): Promise<Technician[]> {
    return db.select().from(technicians).where(eq(technicians.status, status as any));
  }

  async createTechnician(insertTechnician: InsertTechnician): Promise<Technician> {
    const [technician] = await db.insert(technicians).values({
      ...insertTechnician,
      lastUpdate: new Date()
    }).returning();
    return technician;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const [technician] = await db.update(technicians).set({
      ...updates,
      lastUpdate: new Date()
    }).where(eq(technicians.id, id)).returning();
    return technician;
  }

  async assignTechnicianToIssue(technicianId: number, issueId: number): Promise<boolean> {
    const result = await db.update(issues).set({
      assignedTo: technicianId,
      status: "assigned",
      updatedAt: new Date()
    }).where(eq(issues.id, issueId));
    return result.rowCount > 0;
  }

  // Placeholder implementations for other methods (implement as needed)
  async getPayments(): Promise<Payment[]> { return []; }
  async getPayment(id: number): Promise<Payment | undefined> { return undefined; }
  async getPaymentsByType(type: string): Promise<Payment[]> { return []; }
  async createPayment(payment: InsertPayment): Promise<Payment> { throw new Error("Not implemented"); }
  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> { return undefined; }

  async getTeams(): Promise<Team[]> { return []; }
  async getTeam(id: number): Promise<Team | undefined> { return undefined; }
  async getTeamsByDepartment(department: string): Promise<Team[]> { return []; }
  async createTeam(team: InsertTeam): Promise<Team> { throw new Error("Not implemented"); }
  async updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined> { return undefined; }

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

  async getFieldReports(): Promise<FieldReport[]> {
    try {
      return await db.select().from(fieldReports).orderBy(desc(fieldReports.createdAt));
    } catch (error) {
      console.error("Error fetching field reports:", error);
      return [];
    }
  }

  async getFieldReport(id: number): Promise<FieldReport | undefined> {
    try {
      const reports = await db.select().from(fieldReports).where(eq(fieldReports.id, id)).limit(1);
      return reports[0];
    } catch (error) {
      console.error("Error fetching field report:", error);
      return undefined;
    }
  }

  async getFieldReportsByTechnician(technicianId: number): Promise<FieldReport[]> {
    try {
      return await db.select().from(fieldReports)
        .where(eq(fieldReports.technicianId, technicianId))
        .orderBy(desc(fieldReports.createdAt));
    } catch (error) {
      console.error("Error fetching field reports by technician:", error);
      return [];
    }
  }

  async getFieldReportsByIssue(issueId: number): Promise<FieldReport[]> {
    try {
      return await db.select().from(fieldReports)
        .where(eq(fieldReports.issueId, issueId))
        .orderBy(desc(fieldReports.createdAt));
    } catch (error) {
      console.error("Error fetching field reports by issue:", error);
      return [];
    }
  }

  async createFieldReport(report: InsertFieldReport): Promise<FieldReport> {
    try {
      const [newReport] = await db.insert(fieldReports).values({
        ...report,
        createdAt: new Date()
      }).returning();
      return newReport;
    } catch (error) {
      console.error("Error creating field report:", error);
      throw new Error("Failed to create field report");
    }
  }

  async updateFieldReport(id: number, updates: Partial<FieldReport>): Promise<FieldReport | undefined> {
    try {
      const [updatedReport] = await db.update(fieldReports)
        .set(updates)
        .where(eq(fieldReports.id, id))
        .returning();
      return updatedReport;
    } catch (error) {
      console.error("Error updating field report:", error);
      return undefined;
    }
  }

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
  async getTechnicianMessagesByTechnician(technicianId: number): Promise<TechnicianMessage[]> { return []; }
  async createTechnicianMessage(message: InsertTechnicianMessage): Promise<TechnicianMessage> { throw new Error("Not implemented"); }
  async updateTechnicianMessage(id: number, updates: Partial<TechnicianMessage>): Promise<TechnicianMessage | undefined> { return undefined; }

  // Get all technician locations
  async getTechnicianLocations(): Promise<TechnicianLocation[]> {
    return await db.select().from(technicianLocations).orderBy(desc(technicianLocations.timestamp));
  }

  // Get technician location by ID
  async getTechnicianLocation(technicianId: number): Promise<TechnicianLocation | undefined> {
    const result = await db.select()
      .from(technicianLocations)
      .where(eq(technicianLocations.technicianId, technicianId))
      .orderBy(desc(technicianLocations.timestamp))
      .limit(1);
    return result[0] || undefined;
  }

  // Get latest technician location (alias for consistency with API)
  async getLatestTechnicianLocation(technicianId: number): Promise<TechnicianLocation | undefined> {
    return await this.getTechnicianLocation(technicianId);
  }

  // Get all locations for specific technician
  async getTechnicianLocationsByTechnician(technicianId: number): Promise<TechnicianLocation[]> {
    return await db.select()
      .from(technicianLocations)
      .where(eq(technicianLocations.technicianId, technicianId))
      .orderBy(desc(technicianLocations.timestamp));
  }

  // Create new technician location
  async createTechnicianLocation(location: InsertTechnicianLocation): Promise<TechnicianLocation> {
    const [created] = await db.insert(technicianLocations)
      .values({
        ...location,
        timestamp: new Date()
      })
      .returning();
    return created;
  }

  // Update technician location (create or update latest)
  async updateTechnicianLocation(locationData: InsertTechnicianLocation): Promise<TechnicianLocation> {
    // First, try to get existing location for this technician
    const existing = await this.getTechnicianLocation(locationData.technicianId);
    
    if (existing) {
      // Update the latest record for this technician
      const [updated] = await db.update(technicianLocations)
        .set({
          ...locationData,
          timestamp: new Date()
        })
        .where(eq(technicianLocations.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new location record
      return await this.createTechnicianLocation(locationData);
    }
  }

  // Get all technicians with their latest location data
  async getTechniciansWithLocations(): Promise<(Technician & { location?: TechnicianLocation })[]> {
    // Get all technicians
    const allTechnicians = await db.select().from(technicians);
    
    // Get latest location for each technician
    const results = await Promise.all(
      allTechnicians.map(async (tech) => {
        const location = await this.getTechnicianLocation(tech.id);
        return {
          ...tech,
          location: location || undefined
        };
      })
    );
    
    return results;
  }

  async getChatMessages(): Promise<ChatMessage[]> { return []; }
  async getChatMessage(id: number): Promise<ChatMessage | undefined> { return undefined; }
  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> { return []; }
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> { throw new Error("Not implemented"); }
  async updateChatMessage(id: number, updates: Partial<ChatMessage>): Promise<ChatMessage | undefined> { return undefined; }

  async getWhatsappMessages(): Promise<WhatsappMessage[]> { return []; }
  async getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined> { return undefined; }
  async getWhatsappMessagesByConversation(conversationId: number): Promise<WhatsappMessage[]> { return []; }
  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> { throw new Error("Not implemented"); }
  async updateWhatsappMessage(id: number, updates: Partial<WhatsappMessage>): Promise<WhatsappMessage | undefined> { return undefined; }

  async getWhatsappConversations(): Promise<WhatsappConversation[]> { return []; }
  async getWhatsappConversation(id: number): Promise<WhatsappConversation | undefined> { return undefined; }
  async getWhatsappConversationsByUser(userId: number): Promise<WhatsappConversation[]> { return []; }
  async createWhatsappConversation(conversation: InsertWhatsappConversation): Promise<WhatsappConversation> { throw new Error("Not implemented"); }
  async updateWhatsappConversation(id: number, updates: Partial<WhatsappConversation>): Promise<WhatsappConversation | undefined> { return undefined; }

  // Analytics and stats methods
  async getMunicipalityStats(): Promise<any> {
    return {
      totalIssues: 0,
      resolvedIssues: 0,
      avgResolutionTime: 0,
      citizenSatisfaction: 0
    };
  }

  async getDepartmentStats(department?: string): Promise<any> {
    try {
      let techs;
      if (department && department !== 'all') {
        techs = await db.select().from(technicians).where(eq(technicians.department, department));
      } else {
        techs = await db.select().from(technicians);
      }

      const totalTechnicians = techs.length;
      const availableTechnicians = techs.filter(tech => tech.status === 'available').length;
      const onJobTechnicians = techs.filter(tech => tech.status === 'on_job').length;
      const avgPerformance = totalTechnicians > 0 
        ? techs.reduce((sum, tech) => sum + (tech.performanceRating || 0), 0) / totalTechnicians 
        : 0;

      return {
        department: department || "All Departments",
        totalTechnicians,
        availableTechnicians,
        onJobTechnicians,
        avgPerformance: Number(avgPerformance.toFixed(1))
      };
    } catch (error) {
      console.error("Error fetching department stats:", error);
      return {
        department: department || "All Departments",
        totalTechnicians: 0,
        availableTechnicians: 0,
        onJobTechnicians: 0,
        avgPerformance: 0
      };
    }
  }

  async getTechnicianPerformance(): Promise<any[]> {
    try {
      console.log("Fetching technician performance data...");
      const techs = await db.select().from(technicians);
      console.log("Database returned technicians:", techs.length);
      
      const performance = techs.map(tech => ({
        id: tech.id,
        name: tech.name,
        department: tech.department,
        completedIssues: tech.completedIssues || 0,
        performanceRating: tech.performanceRating || 0,
        avgResolutionTime: tech.avgResolutionTime || 0,
        status: tech.status,
        currentLocation: tech.currentLocation
      }));
      
      console.log("Mapped performance data:", performance);
      return performance;
    } catch (error) {
      console.error("Error fetching technician performance:", error);
      return [];
    }
  }

  async getWardStats(wardNumber: string): Promise<any> {
    return {
      wardNumber,
      totalIssues: 0,
      resolvedIssues: 0,
      avgResolutionTime: 0
    };
  }

  // Completion reports operations
  async getCompletionReports(): Promise<CompletionReport[]> {
    // Generate consistent job order numbers (JO-XXX-YYYY format)
    const generateJobOrderNumber = (issueId: number) => {
      const year = new Date().getFullYear();
      const paddedId = String(issueId).padStart(3, '0');
      return `JO-${paddedId}-${year}`;
    };

    return [
      {
        id: 1,
        technicianId: 6,
        issueId: 12,
        jobCardNumber: generateJobOrderNumber(12), // JO-012-2025
        workCompleted: "Repaired water pipe leak using new coupling and sealed connection points. Tested water pressure and flow.",
        materialsUsed: ["PVC Coupling", "Pipe Sealant", "Pipe Clamps"],
        timeTaken: 120,
        issuesFound: "Old pipe coupling was cracked due to age and weather exposure.",
        recommendations: "Recommend inspection of similar connections in the area within 6 months.",
        customerSatisfaction: 5,
        additionalNotes: "Customer was very satisfied with quick resolution. Area cleaned up after work.",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        technicianId: 6,
        issueId: 15,
        jobCardNumber: generateJobOrderNumber(15), // JO-015-2025
        workCompleted: "Fixed streetlight wiring issue, replaced damaged cables and connection box.",
        materialsUsed: ["Electrical Cable", "Junction Box", "Wire Connectors"],
        timeTaken: 90,
        issuesFound: "Water damage to electrical connections caused intermittent power loss.",
        recommendations: "Install weatherproof housing to prevent future water damage.",
        customerSatisfaction: 4,
        additionalNotes: "Coordinated with electricity department for power isolation during repairs.",
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        technicianId: 6,
        issueId: 18,
        jobCardNumber: generateJobOrderNumber(18), // JO-018-2025
        workCompleted: "Cleared blocked storm drain and removed debris. Verified proper water flow.",
        materialsUsed: ["Drain Rod", "High Pressure Hose"],
        timeTaken: 60,
        issuesFound: "Heavy leaf accumulation and small debris blocking drainage system.",
        recommendations: "Schedule regular drainage maintenance before rainy season.",
        customerSatisfaction: 5,
        additionalNotes: "Educated community members about proper waste disposal to prevent future blockages.",
        completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      }
    ];
  }

  async getCompletionReport(id: number): Promise<CompletionReport | undefined> {
    const reports = await this.getCompletionReports();
    return reports.find(r => r.id === id);
  }

  async getCompletionReportsByTechnician(technicianId: number): Promise<CompletionReport[]> {
    const reports = await this.getCompletionReports();
    return reports.filter(r => r.technicianId === technicianId);
  }

  async getCompletionReportByIssue(issueId: number): Promise<CompletionReport | undefined> {
    const reports = await this.getCompletionReports();
    return reports.find(r => r.issueId === issueId);
  }

  async createCompletionReport(report: InsertCompletionReport): Promise<CompletionReport> {
    const newReport: CompletionReport = {
      ...report,
      id: Math.floor(Math.random() * 1000) + 100,
      completedAt: new Date(),
    };
    return newReport;
  }

  // Job card operations
  async getJobCards(): Promise<JobCard[]> {
    return [];
  }

  async getJobCard(id: number): Promise<JobCard | undefined> {
    return undefined;
  }

  async getJobCardByIssueId(issueId: number): Promise<JobCard | undefined> {
    return {
      id: 1,
      jobCardNumber: `JC-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${issueId.toString().padStart(3, '0')}`,
      issueId,
      technicianId: 6,
      description: "Work authorization card",
      priority: "medium",
      status: "active",
      estimatedHours: 2,
      actualHours: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      completedAt: null,
    };
  }

  async getJobCardsByTechnician(technicianId: number): Promise<JobCard[]> {
    return [];
  }

  async createJobCard(jobCard: InsertJobCard): Promise<JobCard> {
    const newJobCard: JobCard = {
      ...jobCard,
      id: Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newJobCard;
  }

  async updateJobCard(id: number, updates: Partial<JobCard>): Promise<JobCard | undefined> {
    return undefined;
  }

  // Job Order methods
  async getAllJobOrders(): Promise<JobOrder[]> {
    return db.select().from(jobOrders).orderBy(desc(jobOrders.createdAt));
  }

  async getJobOrderById(id: number): Promise<JobOrder | null> {
    const [jobOrder] = await db.select().from(jobOrders).where(eq(jobOrders.id, id));
    return jobOrder || null;
  }

  async createJobOrder(data: InsertJobOrder): Promise<JobOrder> {
    const jobOrderNumber = `JO-${Date.now().toString().slice(-6)}-${String(data.issueId).padStart(3, '0')}`;
    const [created] = await db.insert(jobOrders).values({
      ...data,
      jobOrderNumber
    }).returning();
    return created;
  }

  async updateJobOrder(id: number, data: Partial<JobOrder>): Promise<JobOrder> {
    const [updated] = await db.update(jobOrders)
      .set(data)
      .where(eq(jobOrders.id, id))
      .returning();
    return updated;
  }

  async assignJobOrderTechnician(jobOrderId: number, technicianId: number, assignmentData: Partial<JobOrder>): Promise<JobOrder> {
    const [updated] = await db.update(jobOrders)
      .set({
        technicianId,
        assignedAt: new Date(),
        status: 'assigned',
        ...assignmentData
      })
      .where(eq(jobOrders.id, jobOrderId))
      .returning();
    return updated;
  }

  async getJobOrdersWithIssueDetails(): Promise<any[]> {
    const result = await db.select({
      id: jobOrders.id,
      jobOrderNumber: jobOrders.jobOrderNumber,
      issueId: jobOrders.issueId,
      technicianId: jobOrders.technicianId,
      assignedBy: jobOrders.assignedBy,
      priority: jobOrders.priority,
      status: jobOrders.status,
      estimatedHours: jobOrders.estimatedHours,
      actualHours: jobOrders.actualHours,
      specialInstructions: jobOrders.specialInstructions,
      materialsRequired: jobOrders.materialsRequired,
      skillsRequired: jobOrders.skillsRequired,
      safetyNotes: jobOrders.safetyNotes,
      notes: jobOrders.notes,
      createdAt: jobOrders.createdAt,
      assignedAt: jobOrders.assignedAt,
      completedAt: jobOrders.completedAt,
      issue: {
        id: issues.id,
        title: issues.title,
        description: issues.description,
        category: issues.category,
        priority: issues.priority,
        status: issues.status,
        location: issues.location,
        ward: issues.ward,
        reporterName: issues.reporterName,
        reporterPhone: issues.reporterPhone,
        referenceNumber: issues.referenceNumber,
        createdAt: issues.createdAt
      }
    })
    .from(jobOrders)
    .leftJoin(issues, eq(jobOrders.issueId, issues.id))
    .orderBy(desc(jobOrders.createdAt));

    return result;
  }
}