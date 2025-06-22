export type UserRole = "citizen" | "official" | "admin";

export type IssueStatus = "open" | "assigned" | "in_progress" | "resolved" | "closed";

export type IssuePriority = "low" | "medium" | "high" | "emergency";

export type IssueCategory = 
  | "water_sanitation"
  | "electricity" 
  | "roads_transport"
  | "waste_management"
  | "safety_security"
  | "housing"
  | "other";

export type PaymentType = "water" | "electricity" | "rates" | "fine";

export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";

export type TeamStatus = "available" | "on_job" | "maintenance" | "offline";

export interface CreateIssueData {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  location: string;
  ward?: string;
  reporterName?: string;
  reporterPhone?: string;
  photos?: File[];
}

export interface PaymentData {
  id: number;
  type: PaymentType;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  description: string;
}

export interface Statistics {
  openIssues: number;
  inProgress: number;
  resolvedToday: number;
  avgResolution: number;
}
