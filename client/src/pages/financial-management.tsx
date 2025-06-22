import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

interface Bill {
  id: number;
  billNumber: string;
  accountId: number;
  serviceType: string;
  totalAmount: number;
  dueDate: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

interface Payment {
  id: number;
  paymentReference: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  payerName: string;
  billId?: number;
}

interface RevenueDashboard {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  numberOfAccounts: number;
  numberOfBills: number;
  numberOfPayments: number;
}

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch revenue dashboard data
  const { data: revenueDashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/revenue/dashboard"],
    queryFn: () => apiRequest("/api/revenue/dashboard")
  });

  // Fetch bills
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ["/api/bills", serviceTypeFilter, statusFilter],
    queryFn: () => {
      let url = "/api/bills";
      const params = new URLSearchParams();
      if (serviceTypeFilter) params.append("serviceType", serviceTypeFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (params.toString()) url += `?${params.toString()}`;
      return apiRequest(url);
    }
  });

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/municipal-payments"],
    queryFn: () => apiRequest("/api/municipal-payments")
  });

  // Fetch billing accounts
  const { data: billingAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/billing-accounts"],
    queryFn: () => apiRequest("/api/billing-accounts")
  });

  // Payment processing mutation
  const processPayment = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("/api/municipal-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Payment has been successfully processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/municipal-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/revenue/dashboard"] });
      setSelectedBill(null);
      setPaymentAmount("");
      setPaymentMethod("");
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    }
  });

  const handlePayment = () => {
    if (!selectedBill || !paymentAmount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please select a bill, enter amount, and choose payment method.",
        variant: "destructive",
      });
      return;
    }

    processPayment.mutate({
      billId: selectedBill.id,
      accountId: selectedBill.accountId,
      amount: parseFloat(paymentAmount),
      paymentType: "bill_payment",
      paymentMethod,
      payerName: selectedBill.customerName,
      paymentReference: `PAY-${Date.now()}`,
      totalPaid: parseFloat(paymentAmount)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overdue":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case "water":
        return "💧";
      case "electricity":
        return "⚡";
      case "refuse":
        return "🗑️";
      case "rates":
        return "🏠";
      case "sewerage":
        return "🚰";
      default:
        return "📄";
    }
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Management</h1>
          <p className="text-muted-foreground">
            Comprehensive billing, payments, and revenue collection system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Revenue Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R {revenueDashboard?.totalBilled?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueDashboard?.numberOfBills || 0} bills this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R {revenueDashboard?.totalCollected?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueDashboard?.numberOfPayments || 0} payments received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R {revenueDashboard?.totalOutstanding?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pending collections
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueDashboard?.collectionRate?.toFixed(1) || "0"}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueDashboard?.numberOfAccounts || 0} active accounts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bills</CardTitle>
                  <CardDescription>Latest billing activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bills.slice(0, 5).map((bill: Bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getServiceTypeIcon(bill.serviceType)}</span>
                          <div>
                            <p className="font-medium">{bill.billNumber}</p>
                            <p className="text-sm text-muted-foreground">{bill.customerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R {bill.totalAmount.toLocaleString()}</p>
                          <Badge className={getStatusColor(bill.paymentStatus)}>
                            {bill.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{payment.paymentReference}</p>
                            <p className="text-sm text-muted-foreground">{payment.payerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+R {payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{payment.paymentMethod}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bills Management */}
          <TabsContent value="bills" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Services</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="refuse">Refuse Collection</SelectItem>
                    <SelectItem value="rates">Municipal Rates</SelectItem>
                    <SelectItem value="sewerage">Sewerage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Bills
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bills Management</CardTitle>
                <CardDescription>Manage municipal service bills</CardDescription>
              </CardHeader>
              <CardContent>
                {billsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bills.map((bill: Bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{getServiceTypeIcon(bill.serviceType)}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{bill.billNumber}</h3>
                              <Badge className={getStatusColor(bill.paymentStatus)}>
                                {bill.paymentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{bill.customerName}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">R {bill.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground capitalize">{bill.serviceType}</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedBill(bill)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Modal */}
            {selectedBill && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Process Payment - {selectedBill.billNumber}</CardTitle>
                  <CardDescription>Enter payment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bill Amount</Label>
                      <p className="text-lg font-semibold">R {selectedBill.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Customer</Label>
                      <p className="text-lg">{selectedBill.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Payment Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="eft">EFT</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="online">Online Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handlePayment} 
                      disabled={processPayment.isPending}
                      className="flex-1"
                    >
                      {processPayment.isPending ? (
                        <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Process Payment
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedBill(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-600' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {payment.status === 'completed' ? <CheckCircle className="h-5 w-5" /> :
                             payment.status === 'pending' ? <Clock className="h-5 w-5" /> :
                             <XCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{payment.paymentReference}</h3>
                            <p className="text-sm text-muted-foreground">{payment.payerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.paymentDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            +R {payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">{payment.paymentMethod}</p>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Accounts</CardTitle>
                <CardDescription>Manage customer billing accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {billingAccounts.map((account: any) => (
                      <Card key={account.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{account.customerName}</h3>
                            <p className="text-sm text-muted-foreground">Account: {account.accountNumber}</p>
                            <p className="text-sm text-muted-foreground">Type: {account.accountType}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              R {account.currentBalance?.toLocaleString() || "0"}
                            </p>
                            <Badge className={getStatusColor(account.accountStatus)}>
                              {account.accountStatus}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Monthly Revenue Report
                  </CardTitle>
                  <CardDescription>Comprehensive monthly financial summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Collection Analysis
                  </CardTitle>
                  <CardDescription>Payment collection trends and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Outstanding Debts
                  </CardTitle>
                  <CardDescription>Overdue accounts and collection actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}