import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"), // citizen, call_centre_agent, admin
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  municipalityAccountNo: text("municipality_account_no"),
});

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  location: text("location").notNull(),
  ward: text("ward"),
  reporterName: text("reporter_name"),
  reporterPhone: text("reporter_phone"),
  assignedTo: text("assigned_to"),
  photos: text("photos").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  rating: integer("rating"),
  feedback: text("feedback"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // water, electricity, rates, fine
  amount: integer("amount").notNull(), // in cents
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"),
  accountNumber: text("account_number"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default("available"),
  currentLocation: text("current_location"),
  members: text("members").array(),
  equipment: text("equipment").array(),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
});

export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  department: text("department").notNull(),
  skills: text("skills").array(),
  status: text("status").notNull().default("available"), // available, on_job, offline
  currentLocation: text("current_location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  teamId: integer("team_id"),
  performanceRating: integer("performance_rating").default(5),
  completedIssues: integer("completed_issues").default(0),
  avgResolutionTime: integer("avg_resolution_time").default(0), // in hours
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
});

export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  wardNumber: text("ward_number").notNull().unique(),
  name: text("name").notNull(),
  councillorName: text("councillor_name"),
  councillorPhone: text("councillor_phone"),
  councillorEmail: text("councillor_email"),
  population: integer("population"),
  area: text("area"), // in km²
  description: text("description"),
});

export const issueUpdates = pgTable("issue_updates", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull(),
  status: text("status").notNull(),
  comment: text("comment"),
  updatedBy: text("updated_by"),
  technicianId: integer("technician_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // water, electricity
  amount: integer("amount").notNull(), // in cents
  voucherCode: text("voucher_code").notNull().unique(),
  status: text("status").notNull().default("active"), // active, used, expired
  purchasedBy: text("purchased_by"),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(),
  usedDate: timestamp("used_date"),
});

export const fieldReports = pgTable("field_reports", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull(),
  technicianId: integer("technician_id").notNull(),
  arrivalTime: timestamp("arrival_time"),
  departureTime: timestamp("departure_time"),
  travelTimeMinutes: integer("travel_time_minutes"),
  workCompletedPercentage: integer("work_completed_percentage").default(0),
  sitePhotos: text("site_photos").array(),
  technicianNotes: text("technician_notes"),
  citizenFeedback: text("citizen_feedback"),
  citizenSignature: text("citizen_signature"),
  partsUsed: text("parts_used").array(),
  partsOrdered: text("parts_ordered").array(),
  nextVisitRequired: boolean("next_visit_required").default(false),
  nextVisitDate: timestamp("next_visit_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partsInventory = pgTable("parts_inventory", {
  id: serial("id").primaryKey(),
  partNumber: text("part_number").notNull().unique(),
  partName: text("part_name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  unitPrice: integer("unit_price").notNull(), // in cents
  stockQuantity: integer("stock_quantity").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(5),
  supplier: text("supplier"),
  lastOrderDate: timestamp("last_order_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partsOrders = pgTable("parts_orders", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").notNull(),
  issueId: integer("issue_id"),
  fieldReportId: integer("field_report_id"),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, approved, ordered, delivered, cancelled
  priority: text("priority").notNull().default("normal"), // urgent, high, normal, low
  partsRequested: text("parts_requested").array(), // JSON array of {partId, quantity, justification}
  totalEstimatedCost: integer("total_estimated_cost"), // in cents
  justification: text("justification").notNull(),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  orderDate: timestamp("order_date"),
  expectedDelivery: timestamp("expected_delivery"),
  deliveredAt: timestamp("delivered_at"),
  deliveryLocation: text("delivery_location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const technicianMessages = pgTable("technician_messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  issueId: integer("issue_id"),
  fieldReportId: integer("field_report_id"),
  messageType: text("message_type").notNull().default("general"), // general, urgent, parts_request, status_update
  subject: text("subject"),
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false),
  priority: text("priority").notNull().default("normal"), // urgent, high, normal, low
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

export const technicianLocations = pgTable("technician_locations", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  address: text("address"),
  isOnSite: boolean("is_on_site").default(false),
  currentIssueId: integer("current_issue_id"),
  speed: integer("speed"), // km/h
  heading: integer("heading"), // degrees
  accuracy: integer("accuracy"), // meters
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  lastUpdate: true,
});

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  lastUpdate: true,
});

export const insertWardSchema = createInsertSchema(wards).omit({
  id: true,
});

export const insertIssueUpdateSchema = createInsertSchema(issueUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  purchaseDate: true,
});

export const insertFieldReportSchema = createInsertSchema(fieldReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartsInventorySchema = createInsertSchema(partsInventory).omit({
  id: true,
  createdAt: true,
});

export const insertPartsOrderSchema = createInsertSchema(partsOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  orderNumber: true,
});

export const insertTechnicianMessageSchema = createInsertSchema(technicianMessages).omit({
  id: true,
  createdAt: true,
});

export const insertTechnicianLocationSchema = createInsertSchema(technicianLocations).omit({
  id: true,
  timestamp: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Ward = typeof wards.$inferSelect;
export type InsertWard = z.infer<typeof insertWardSchema>;
export type IssueUpdate = typeof issueUpdates.$inferSelect;
export type InsertIssueUpdate = z.infer<typeof insertIssueUpdateSchema>;
export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type FieldReport = typeof fieldReports.$inferSelect;
export type InsertFieldReport = z.infer<typeof insertFieldReportSchema>;
export type PartsInventory = typeof partsInventory.$inferSelect;
export type InsertPartsInventory = z.infer<typeof insertPartsInventorySchema>;
export type PartsOrder = typeof partsOrders.$inferSelect;
export type InsertPartsOrder = z.infer<typeof insertPartsOrderSchema>;
export type TechnicianMessage = typeof technicianMessages.$inferSelect;
export type InsertTechnicianMessage = z.infer<typeof insertTechnicianMessageSchema>;
export type TechnicianLocation = typeof technicianLocations.$inferSelect;
export type InsertTechnicianLocation = z.infer<typeof insertTechnicianLocationSchema>;

// Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: integer("user_id"),
  message: text("message").notNull(),
  isBot: boolean("is_bot").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  messageType: text("message_type").default("text").notNull(), // text, image, file, quick_reply
  metadata: json("metadata"), // for storing additional data like quick reply options
});

// WhatsApp Messages Table
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  messageId: text("message_id"),
  status: text("status").default("sent").notNull(), // sent, delivered, read, failed
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  webhookData: json("webhook_data"), // store raw webhook data
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
  id: true,
  timestamp: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
