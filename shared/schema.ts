import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"), // citizen, official, admin
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
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
