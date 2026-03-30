"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export default function IngestPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    source_channel: "mobile_banking",
    customer_id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    original_feedback: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.original_feedback) return;

    setLoading(true);
    try {
      const response = await fetch("/api/process-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          created: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Feedback ingested and processed by AI");
        setForm({ ...form, original_feedback: "", customer_id: `CUST-${Math.floor(1000 + Math.random() * 9000)}` });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Processing failed. Please check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Ingest Feedback</CardTitle>
          <CardDescription>
            Simulate incoming customer feedback from various bank channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Channel</Label>
                <Select 
                  value={form.source_channel} 
                  onValueChange={(v) => setForm({...form, source_channel: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branches">Branches</SelectItem>
                    <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                    <SelectItem value="internet_banking">Internet Banking</SelectItem>
                    <SelectItem value="phone_banking">Phone Banking</SelectItem>
                    <SelectItem value="call_centers">Call Centers</SelectItem>
                    <SelectItem value="email_support">Email Support</SelectItem>
                    <SelectItem value="regulators">Regulators</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="mass_media">Mass Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Customer ID</Label>
                <Input value={form.customer_id} readOnly className="bg-slate-50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer Feedback</Label>
              <Textarea 
                placeholder="Type raw customer feedback here (any language)..."
                rows={5}
                value={form.original_feedback}
                onChange={(e) => setForm({...form, original_feedback: e.target.value})}
              />
              <p className="text-[10px] text-slate-400">
                AI will automatically triage, translate, and assign this feedback upon submission.
              </p>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "AI Processing..." : "Ingest Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}