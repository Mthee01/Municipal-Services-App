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
