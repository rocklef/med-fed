import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Payment = {
  id: number;
  patientId?: number | null;
  payerName?: string | null;
  amount: number;
  currency: string;
  method: "Cash" | "UPI" | "Card" | "Cheque" | "Other";
  status: "Paid" | "Pending" | "Refunded";
  notes?: string | null;
  createdAt: string;
};

const Payments = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const { toast } = useToast();
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [payerName, setPayerName] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [method, setMethod] = useState<Payment["method"]>("Cash");
  const [status, setStatus] = useState<Payment["status"]>("Paid");
  const [notes, setNotes] = useState("");

  const totalPaid = useMemo(() => items.filter(i => i.status === 'Paid').reduce((s,i)=> s + i.amount, 0), [items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/payments`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [API_URL]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        payerName: payerName.trim() || undefined,
        patientId: patientId ? Number(patientId) : undefined,
        amount: Number(amount),
        currency,
        method,
        status,
        notes: notes.trim() || undefined,
      };
      const res = await fetch(`${API_URL}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create');
      toast({ title: 'Payment recorded', description: `₹${data.amount} ${data.method}` });
      setPayerName(""); setPatientId(""); setAmount(""); setCurrency("INR"); setMethod("Cash"); setStatus("Paid"); setNotes("");
      fetchItems();
    } catch (err) {
      toast({ title: 'Failed to record payment', description: err instanceof Error ? err.message : 'Unknown', variant: 'destructive' });
    }
  };

  const remove = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/payments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchItems();
    } catch (err) {
      toast({ title: 'Failed to delete', description: err instanceof Error ? err.message : 'Unknown', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Record offline payments and view receipts</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 medical-card lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Payer Name</Label>
                <Input value={payerName} onChange={e=>setPayerName(e.target.value)} placeholder="Patient or payer" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Patient ID</Label>
                <Input value={patientId} onChange={e=>setPatientId(e.target.value)} placeholder="e.g. 1" className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0" step="0.01" className="bg-background" required />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={method} onValueChange={(v)=>setMethod(v as any)}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Method"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v)=>setStatus(v as any)}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Status"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="optional" className="bg-background" />
              </div>
              <Button type="submit" className="w-full medical-gradient text-white">Record Payment</Button>
            </form>
          </Card>

          <Card className="p-6 medical-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Payments</h3>
              <Badge variant="outline" className="text-accent border-accent">{items.length} Records</Badge>
            </div>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">Loading…</div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Total Paid: ₹{totalPaid.toFixed(2)}</div>
                {items.length === 0 && (
                  <div className="py-10 text-center text-muted-foreground">No payments yet.</div>
                )}
                {items.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="font-medium">₹{p.amount} {p.currency} • {p.method}</div>
                      <div className="text-xs text-muted-foreground">{p.payerName || `Patient #${p.patientId}` } • {new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={p.status === 'Paid' ? 'default' : 'secondary'}>{p.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={()=>remove(p.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payments;


