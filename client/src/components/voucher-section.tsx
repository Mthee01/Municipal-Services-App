import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Droplets, Zap, CreditCard, Ticket, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import type { VoucherData } from "@/lib/types";

const VOUCHER_PRESETS = {
  water: [
    { amount: 50, label: "R50 Water" },
    { amount: 100, label: "R100 Water" },
    { amount: 200, label: "R200 Water" },
    { amount: 500, label: "R500 Water" },
  ],
  electricity: [
    { amount: 50, label: "R50 Electricity" },
    { amount: 100, label: "R100 Electricity" },
    { amount: 200, label: "R200 Electricity" },
    { amount: 500, label: "R500 Electricity" },
  ],
};

interface VoucherPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "water" | "electricity";
  amount: number;
}

function VoucherPurchaseModal({ isOpen, onClose, type, amount }: VoucherPurchaseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [purchasedVoucher, setPurchasedVoucher] = useState<VoucherData | null>(null);
  const [copied, setCopied] = useState(false);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/vouchers", { type, amount });
      return response.json();
    },
    onSuccess: (voucher) => {
      setPurchasedVoucher(voucher);
      queryClient.invalidateQueries({ queryKey: ["/api/vouchers"] });
      toast({
        title: "Voucher Purchased Successfully",
        description: `${type === 'water' ? 'Water' : 'Electricity'} voucher for ${formatCurrency(amount)} has been created.`,
      });
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "Unable to purchase voucher. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    purchaseMutation.mutate();
  };

  const copyVoucherCode = () => {
    if (purchasedVoucher) {
      navigator.clipboard.writeText(purchasedVoucher.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Voucher Code Copied",
        description: "The voucher code has been copied to your clipboard.",
      });
    }
  };

  const handleClose = () => {
    setPurchasedVoucher(null);
    setCopied(false);
    onClose();
  };

  if (purchasedVoucher) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-green-600" />
              Voucher Purchased Successfully
            </DialogTitle>
            <DialogDescription>
              Your {type} voucher has been created. Save the voucher code below:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-2">Voucher Code</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-white px-3 py-2 rounded border text-lg font-mono">
                    {purchasedVoucher.voucherCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyVoucherCode}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium capitalize">{purchasedVoucher.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-medium">{formatCurrency(purchasedVoucher.amount / 100)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div>
                <p className="text-gray-600">Expires</p>
                <p className="text-xs">{new Date(purchasedVoucher.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'water' ? <Droplets className="h-5 w-5 text-blue-600" /> : <Zap className="h-5 w-5 text-yellow-600" />}
            Purchase {type === 'water' ? 'Water' : 'Electricity'} Voucher
          </DialogTitle>
          <DialogDescription>
            Purchase a {formatCurrency(amount)} {type} voucher for prepaid services.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-lg font-semibold">{formatCurrency(amount)}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Service Fee</span>
              <span className="text-sm">R0.00</span>
            </div>
            <hr className="my-2" />
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleClose} 
              variant="outline" 
              className="flex-1"
              disabled={purchaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              className="flex-1 bg-sa-green hover:bg-green-600"
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Voucher
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VoucherSection() {
  const [selectedVoucher, setSelectedVoucher] = useState<{ type: "water" | "electricity"; amount: number } | null>(null);
  const [customAmounts, setCustomAmounts] = useState({ water: "", electricity: "" });

  const { data: vouchers = [] } = useQuery({
    queryKey: ["/api/vouchers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/vouchers");
      return response.json();
    },
  });

  const recentVouchers = vouchers.slice(0, 3);

  const handlePresetClick = (type: "water" | "electricity", amount: number) => {
    setSelectedVoucher({ type, amount });
  };

  const handleCustomPurchase = (type: "water" | "electricity") => {
    const amount = parseFloat(customAmounts[type]);
    if (amount >= 10) {
      setSelectedVoucher({ type, amount });
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold" style={{ color: 'hsl(220, 85%, 15%)' }}>Buy Vouchers</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Water Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Droplets className="h-5 w-5" />
              Water Vouchers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {VOUCHER_PRESETS.water.map((preset) => (
                <Button
                  key={preset.amount}
                  variant="outline"
                  className="h-auto py-3 flex flex-col"
                  onClick={() => handlePresetClick("water", preset.amount)}
                >
                  <span className="font-semibold">{formatCurrency(preset.amount)}</span>
                  <span className="text-xs text-gray-500">Water</span>
                </Button>
              ))}
            </div>
            
            <div className="pt-2 border-t">
              <Label htmlFor="water-custom" className="text-sm text-gray-600">Custom Amount (min R10)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="water-custom"
                  type="number"
                  placeholder="Enter amount"
                  min="10"
                  value={customAmounts.water}
                  onChange={(e) => setCustomAmounts(prev => ({ ...prev, water: e.target.value }))}
                />
                <Button
                  onClick={() => handleCustomPurchase("water")}
                  disabled={!customAmounts.water || parseFloat(customAmounts.water) < 10}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Buy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Electricity Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Zap className="h-5 w-5" />
              Electricity Vouchers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {VOUCHER_PRESETS.electricity.map((preset) => (
                <Button
                  key={preset.amount}
                  variant="outline"
                  className="h-auto py-3 flex flex-col"
                  onClick={() => handlePresetClick("electricity", preset.amount)}
                >
                  <span className="font-semibold">{formatCurrency(preset.amount)}</span>
                  <span className="text-xs text-gray-500">Electricity</span>
                </Button>
              ))}
            </div>
            
            <div className="pt-2 border-t">
              <Label htmlFor="electricity-custom" className="text-sm text-gray-600">Custom Amount (min R10)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="electricity-custom"
                  type="number"
                  placeholder="Enter amount"
                  min="10"
                  value={customAmounts.electricity}
                  onChange={(e) => setCustomAmounts(prev => ({ ...prev, electricity: e.target.value }))}
                />
                <Button
                  onClick={() => handleCustomPurchase("electricity")}
                  disabled={!customAmounts.electricity || parseFloat(customAmounts.electricity) < 10}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Buy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Vouchers */}
      {recentVouchers.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: 'hsl(220, 85%, 15%)' }}>Recent Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVouchers.map((voucher) => (
                <div key={voucher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {voucher.type === 'water' ? 
                      <Droplets className="h-4 w-4 text-blue-600" /> : 
                      <Zap className="h-4 w-4 text-yellow-600" />
                    }
                    <div>
                      <p className="font-medium">{formatCurrency(voucher.amount / 100)} {voucher.type}</p>
                      <p className="text-xs text-gray-500">{voucher.voucherCode}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={voucher.status === 'active' ? 'default' : voucher.status === 'used' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {voucher.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Modal */}
      {selectedVoucher && (
        <VoucherPurchaseModal
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          type={selectedVoucher.type}
          amount={selectedVoucher.amount}
        />
      )}
    </section>
  );
}