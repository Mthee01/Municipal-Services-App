import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"), // citizen, official, admin, mayor, wardCouncillor, techManager, systemAdmin
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  municipalityAccountNo: text("municipality_account_no"),
  avatar: text("avatar"),
  preferences: json("preferences").$type<{
    notifications: boolean;
    language: string;
    theme: string;
    emailUpdates: boolean;
    smsUpdates: boolean;
  }>(),
  lastLogin: timestamp("last_login"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  deviceTokens: text("device_tokens").array(),
});

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  ward: text("ward"),
  reporterName: text("reporter_name"),
  reporterPhone: text("reporter_phone"),
  reporterId: integer("reporter_id"),
  assignedTo: text("assigned_to"),
  assignedTechnicianId: integer("assigned_technician_id"),
  photos: text("photos").array(),
  videos: text("videos").array(),
  audioNotes: text("audio_notes").array(),
  duplicateOf: integer("duplicate_of"),
  votes: integer("votes").default(0),
  communityImpact: text("community_impact"),
  estimatedCost: integer("estimated_cost"),
  actualCost: integer("actual_cost"),
  estimatedResolutionTime: integer("estimated_resolution_time"), // in hours
  actualResolutionTime: integer("actual_resolution_time"), // in hours
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  rating: integer("rating"),
  feedback: text("feedback"),
  tags: text("tags").array(),
  isEmergency: boolean("is_emergency").default(false),
  visibility: text("visibility").default("public"), // public, private, ward_only
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

// New advanced feature tables
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // issue_update, payment_due, system_alert, etc.
  priority: text("priority").default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  relatedId: integer("related_id"), // ID of related issue, payment, etc.
  relatedType: text("related_type"), // issue, payment, voucher, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

export const issueVotes = pgTable("issue_votes", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull(),
  userId: integer("user_id").notNull(),
  voteType: text("vote_type").notNull(), // upvote, downvote
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // discussion, announcement, poll, resource_share
  ward: text("ward"),
  tags: text("tags").array(),
  attachments: text("attachments").array(),
  isSticky: boolean("is_sticky").default(false),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: integer("author_id").notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // for nested comments
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  serviceType: text("service_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").default("normal"),
  status: text("status").default("pending"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  actualDuration: integer("actual_duration"), // in minutes
  cost: integer("cost"), // in cents
  rating: integer("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id"),
  issueId: integer("issue_id"), // for issue-related chats
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // text, image, audio, file
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const predictiveAnalytics = pgTable("predictive_analytics", {
  id: serial("id").primaryKey(),
  analysisType: text("analysis_type").notNull(), // trend_prediction, resource_allocation, budget_impact
  ward: text("ward"),
  department: text("department"),
  timeframe: text("timeframe"), // monthly, quarterly, yearly
  predictions: json("predictions"),
  confidence: real("confidence"),
  basedOnPeriod: text("based_on_period"),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // user, issue, payment, etc.
  entityId: integer("entity_id"),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // maintenance, outage, update, emergency
  severity: text("severity").notNull(), // info, warning, error, critical
  targetRoles: text("target_roles").array(), // which user roles should see this
  targetWards: text("target_wards").array(),
  isActive: boolean("is_active").default(true),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  searchTerm: text("search_term").notNull(),
  searchType: text("search_type"), // issues, payments, users, etc.
  filters: json("filters"),
  resultsCount: integer("results_count"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  deviceType: text("device_type"), // mobile, desktop, tablet
  deviceInfo: text("device_info"),
  ipAddress: text("ip_address"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const municipalBudgets = pgTable("municipal_budgets", {
  id: serial("id").primaryKey(),
  department: text("department").notNull(),
  category: text("category").notNull(),
  budgetYear: integer("budget_year").notNull(),
  allocatedAmount: integer("allocated_amount").notNull(), // in cents
  spentAmount: integer("spent_amount").default(0), // in cents
  description: text("description"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // user, department, ward, municipality
  entityId: integer("entity_id"),
  metricType: text("metric_type").notNull(), // response_time, resolution_rate, satisfaction_score
  value: real("value").notNull(),
  period: text("period"), // daily, weekly, monthly, quarterly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  issues: many(issues),
  payments: many(payments),
  notifications: many(notifications),
  votes: many(issueVotes),
  posts: many(communityPosts),
  comments: many(communityComments),
  serviceRequests: many(serviceRequests),
  sentMessages: many(chatMessages, { relationName: "sender" }),
  receivedMessages: many(chatMessages, { relationName: "receiver" }),
  sessions: many(userSessions),
  auditLogs: many(auditLogs),
  searchHistory: many(searchHistory),
}));

export const issueRelations = relations(issues, ({ one, many }) => ({
  reporter: one(users, { fields: [issues.reporterId], references: [users.id] }),
  assignedTechnician: one(technicians, { fields: [issues.assignedTechnicianId], references: [technicians.id] }),
  votes: many(issueVotes),
  updates: many(issueUpdates),
  chatMessages: many(chatMessages),
  duplicate: one(issues, { fields: [issues.duplicateOf], references: [issues.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

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

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertIssueVoteSchema = createInsertSchema(issueVotes).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPredictiveAnalyticsSchema = createInsertSchema(predictiveAnalytics).omit({
  id: true,
  generatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertMunicipalBudgetSchema = createInsertSchema(municipalBudgets).omit({
  id: true,
  lastUpdated: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  createdAt: true,
});

// Type definitions
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
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type IssueVote = typeof issueVotes.$inferSelect;
export type InsertIssueVote = z.infer<typeof insertIssueVoteSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type PredictiveAnalytics = typeof predictiveAnalytics.$inferSelect;
export type InsertPredictiveAnalytics = z.infer<typeof insertPredictiveAnalyticsSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type MunicipalBudget = typeof municipalBudgets.$inferSelect;
export type InsertMunicipalBudget = z.infer<typeof insertMunicipalBudgetSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;

// Financial Management System Tables
export const billingAccounts = pgTable("billing_accounts", {
  id: serial("id").primaryKey(),
  accountNumber: text("account_number").notNull().unique(),
  userId: integer("user_id"),
  propertyId: text("property_id"),
  accountType: text("account_type").notNull(), // residential, commercial, industrial
  accountStatus: text("account_status").notNull().default("active"), // active, suspended, closed
  customerName: text("customer_name").notNull(),
  billingAddress: text("billing_address").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  meterNumber: text("meter_number"),
  tariffCategory: text("tariff_category").notNull(),
  connectionDate: timestamp("connection_date"),
  lastReadingDate: timestamp("last_reading_date"),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).default("0.00"),
  previousBalance: decimal("previous_balance", { precision: 10, scale: 2 }).default("0.00"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  billNumber: text("bill_number").notNull().unique(),
  accountId: integer("account_id").notNull(),
  billType: text("bill_type").notNull(), // monthly, quarterly, annual, special
  serviceType: text("service_type").notNull(), // water, electricity, refuse, rates, sewerage
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  issueDate: timestamp("issue_date").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  meterReadingPrevious: decimal("meter_reading_previous", { precision: 10, scale: 2 }),
  meterReadingCurrent: decimal("meter_reading_current", { precision: 10, scale: 2 }),
  consumption: decimal("consumption", { precision: 10, scale: 2 }),
  unitRate: decimal("unit_rate", { precision: 10, scale: 4 }),
  basicCharge: decimal("basic_charge", { precision: 10, scale: 2 }).default("0.00"),
  consumptionCharge: decimal("consumption_charge", { precision: 10, scale: 2 }).default("0.00"),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  outstandingAmount: decimal("outstanding_amount", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, partial, paid, overpaid
  lateFee: decimal("late_fee", { precision: 10, scale: 2 }).default("0.00"),
  disconnectionNotice: boolean("disconnection_notice").default(false),
  printCount: integer("print_count").default(0),
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const municipalPayments = pgTable("municipal_payments", {
  id: serial("id").primaryKey(),
  paymentReference: text("payment_reference").notNull().unique(),
  billId: integer("bill_id"),
  accountId: integer("account_id").notNull(),
  paymentType: text("payment_type").notNull(), // bill_payment, deposit, penalty, refund
  paymentMethod: text("payment_method").notNull(), // cash, card, eft, mobile_money, online
  paymentChannel: text("payment_channel"), // office, atm, mobile_app, website, bank
  transactionId: text("transaction_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }).default("0.00"),
  vatOnFee: decimal("vat_on_fee", { precision: 10, scale: 2 }).default("0.00"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  processedDate: timestamp("processed_date"),
  status: text("status").notNull().default("pending"), // pending, completed, failed, cancelled, refunded
  payerName: text("payer_name"),
  payerContact: text("payer_contact"),
  cashierName: text("cashier_name"),
  cashierId: integer("cashier_id"),
  receiptNumber: text("receipt_number"),
  reversalReason: text("reversal_reason"),
  reversalDate: timestamp("reversal_date"),
  reconciled: boolean("reconciled").default(false),
  bankReference: text("bank_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const revenueCategories = pgTable("revenue_categories", {
  id: serial("id").primaryKey(),
  categoryCode: text("category_code").notNull().unique(),
  categoryName: text("category_name").notNull(),
  description: text("description"),
  serviceType: text("service_type"), // water, electricity, refuse, rates, sewerage, licensing
  isActive: boolean("is_active").default(true),
  accountingCode: text("accounting_code"),
  vatApplicable: boolean("vat_applicable").default(true),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tariffStructures = pgTable("tariff_structures", {
  id: serial("id").primaryKey(),
  tariffCode: text("tariff_code").notNull().unique(),
  tariffName: text("tariff_name").notNull(),
  serviceType: text("service_type").notNull(),
  customerCategory: text("customer_category").notNull(), // residential, commercial, industrial
  basicCharge: decimal("basic_charge", { precision: 10, scale: 2 }).default("0.00"),
  unitRate: decimal("unit_rate", { precision: 10, scale: 4 }).notNull(),
  blockStructure: json("block_structure").$type<{
    blocks: Array<{
      from: number;
      to: number;
      rate: number;
    }>;
  }>(),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  approvedBy: text("approved_by"),
  approvalDate: timestamp("approval_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  transactionType: text("transaction_type").notNull(), // payment, refund, adjustment, reversal
  sourceType: text("source_type").notNull(), // payment, bill, adjustment
  sourceId: integer("source_id").notNull(),
  accountId: integer("account_id"),
  debitAmount: decimal("debit_amount", { precision: 10, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 10, scale: 2 }).default("0.00"),
  runningBalance: decimal("running_balance", { precision: 10, scale: 2 }),
  description: text("description").notNull(),
  referenceNumber: text("reference_number"),
  transactionDate: timestamp("transaction_date").defaultNow(),
  valueDate: timestamp("value_date"),
  postedDate: timestamp("posted_date"),
  reversedTransactionId: integer("reversed_transaction_id"),
  batchId: text("batch_id"),
  createdBy: integer("created_by"),
  status: text("status").default("posted"), // posted, reversed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  planNumber: text("plan_number").notNull().unique(),
  accountId: integer("account_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  installmentAmount: decimal("installment_amount", { precision: 10, scale: 2 }).notNull(),
  installmentCount: integer("installment_count").notNull(),
  installmentFrequency: text("installment_frequency").notNull(), // weekly, monthly, quarterly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active"), // active, completed, defaulted, cancelled
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0.00"),
  setupFee: decimal("setup_fee", { precision: 10, scale: 2 }).default("0.00"),
  balanceRemaining: decimal("balance_remaining", { precision: 10, scale: 2 }),
  lastPaymentDate: timestamp("last_payment_date"),
  defaultDate: timestamp("default_date"),
  notes: text("notes"),
  createdBy: integer("created_by"),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const revenueReports = pgTable("revenue_reports", {
  id: serial("id").primaryKey(),
  reportType: text("report_type").notNull(), // daily, weekly, monthly, quarterly, annual
  reportPeriod: text("report_period").notNull(),
  serviceType: text("service_type"),
  totalBilled: decimal("total_billed", { precision: 15, scale: 2 }).default("0.00"),
  totalCollected: decimal("total_collected", { precision: 15, scale: 2 }).default("0.00"),
  totalOutstanding: decimal("total_outstanding", { precision: 15, scale: 2 }).default("0.00"),
  collectionRate: decimal("collection_rate", { precision: 5, scale: 2 }),
  numberOfAccounts: integer("number_of_accounts"),
  numberOfBills: integer("number_of_bills"),
  numberOfPayments: integer("number_of_payments"),
  averageBillAmount: decimal("average_bill_amount", { precision: 10, scale: 2 }),
  reportData: json("report_data").$type<{
    categories: Array<{
      category: string;
      billed: number;
      collected: number;
      outstanding: number;
    }>;
    trends: Array<{
      period: string;
      amount: number;
    }>;
  }>(),
  generatedBy: integer("generated_by"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Financial Relations
export const billingAccountRelations = relations(billingAccounts, ({ one, many }) => ({
  user: one(users, { fields: [billingAccounts.userId], references: [users.id] }),
  bills: many(bills),
  payments: many(municipalPayments),
  transactions: many(financialTransactions),
  paymentPlans: many(paymentPlans),
}));

export const billRelations = relations(bills, ({ one, many }) => ({
  account: one(billingAccounts, { fields: [bills.accountId], references: [billingAccounts.id] }),
  payments: many(municipalPayments),
  transactions: many(financialTransactions),
}));

export const municipalPaymentRelations = relations(municipalPayments, ({ one }) => ({
  bill: one(bills, { fields: [municipalPayments.billId], references: [bills.id] }),
  account: one(billingAccounts, { fields: [municipalPayments.accountId], references: [billingAccounts.id] }),
  cashier: one(users, { fields: [municipalPayments.cashierId], references: [users.id] }),
}));

// Financial Insert Schemas
export const insertBillingAccountSchema = createInsertSchema(billingAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMunicipalPaymentSchema = createInsertSchema(municipalPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRevenueCategorySchema = createInsertSchema(revenueCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTariffStructureSchema = createInsertSchema(tariffStructures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRevenueReportSchema = createInsertSchema(revenueReports).omit({
  id: true,
  generatedAt: true,
});

// Financial Type Definitions
export type BillingAccount = typeof billingAccounts.$inferSelect;
export type InsertBillingAccount = z.infer<typeof insertBillingAccountSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type MunicipalPayment = typeof municipalPayments.$inferSelect;
export type InsertMunicipalPayment = z.infer<typeof insertMunicipalPaymentSchema>;
export type RevenueCategory = typeof revenueCategories.$inferSelect;
export type InsertRevenueCategory = z.infer<typeof insertRevenueCategorySchema>;
export type TariffStructure = typeof tariffStructures.$inferSelect;
export type InsertTariffStructure = z.infer<typeof insertTariffStructureSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type RevenueReport = typeof revenueReports.$inferSelect;
export type InsertRevenueReport = z.infer<typeof insertRevenueReportSchema>;
