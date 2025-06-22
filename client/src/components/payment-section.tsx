import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplet, Zap, Home, Car } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@shared/schema";

const paymentIcons = {
  water: Droplet,
  electricity: Zap,
  rates: Home,
  fine: Car,
};

const paymentColors = {
  water: "bg-blue-100 text-blue-600",
  electricity: "bg-yellow-100 text-yellow-600", 
  rates: "bg-green-100 text-green-600",
  fine: "bg-red-100 text-red-600",
};

export function PaymentSection() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const handlePayment = (payment: Payment) => {
    // Mock payment processing
    alert(`Payment processing for ${payment.description}: ${formatCurrency(payment.amount)}`);
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-civic-gray">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Municipal Payments</h3>
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-civic-gray">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Municipal Payments</h3>
          <p className="text-gray-600">Pay your bills and fines conveniently online</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {payments.map((payment) => {
            const Icon = paymentIcons[payment.type as keyof typeof paymentIcons];
            const isOverdue = new Date(payment.dueDate) < new Date() && payment.status === "pending";
            
            return (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${paymentColors[payment.type as keyof typeof paymentColors]}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                    {payment.type === "rates" ? "Property Rates" : payment.type} Bill
                  </h4>
                  <p className={`text-2xl font-bold mb-2 ${isOverdue ? "text-red-600" : "text-sa-green"}`}>
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className={`text-sm mb-4 ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                    Due: {formatDate(payment.dueDate)}
                    {isOverdue && " (Overdue)"}
                  </p>
                  
                  <Badge 
                    className={payment.status === "paid" ? "bg-green-100 text-green-800 mb-4" : "bg-yellow-100 text-yellow-800 mb-4"}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                  
                  {payment.status === "pending" && (
                    <Button 
                      className={`w-full font-medium transition-colors ${isOverdue ? "bg-red-500 hover:bg-red-600" : "bg-sa-green hover:bg-green-700"} text-white`}
                      onClick={() => handlePayment(payment)}
                    >
                      {isOverdue ? "Pay Now" : "Pay Now"}
                    </Button>
                  )}
                  
                  {payment.status === "paid" && (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Paid
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {payments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No outstanding payments at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
}
