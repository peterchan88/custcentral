"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, History } from "lucide-react";

export const FeedbackDetailDrawer = ({ item, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({ ...item });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('feedback')
      .update({
        feedback_en: formData.feedback_en,
        sentiment: formData.sentiment,
        category: formData.category,
        severity: parseInt(formData.severity),
        assignee: formData.assignee,
        summary: formData.summary,
        suggested_actions: formData.suggested_actions,
        action_taken: formData.action_taken,
        status: 'Reviewed',
        updated_by: 'Internal Staff', // Mock user
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (error) {
      toast.error("Failed to update feedback");
    } else {
      toast.success("Feedback updated successfully");
      onUpdate();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Feedback Analysis Detail</SheetTitle>
          <SheetDescription>Customer: {item.customer_id} | Confidence: {(item.confidence_score * 100).toFixed(0)}%</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <Label className="text-xs uppercase text-slate-500 font-bold">Original Feedback</Label>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed italic">"{item.original_feedback}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Select value={formData.sentiment} onValueChange={(v) => setFormData({...formData, sentiment: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="unclassified">Unclassified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity (0-6)</Label>
              <Select value={formData.severity?.toString()} onValueChange={(v) => setFormData({...formData, severity: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0,1,2,3,4,5,6].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="praise">Praise</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="unclassified">Unclassified</SelectItem>
                <SelectItem value="scam_detected">Scam Detected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select value={formData.assignee} onValueChange={(v) => setFormData({...formData, assignee: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Relationship Manager">Relationship Manager</SelectItem>
                <SelectItem value="Product Team">Product Team</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Customer Experience & Operations">CX & Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>AI Summary</Label>
            <Textarea 
              value={formData.summary} 
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Suggested Actions</Label>
            <Textarea 
              value={formData.suggested_actions} 
              onChange={(e) => setFormData({...formData, suggested_actions: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center gap-2">
              <History className="w-4 h-4" /> Action Taken (Manual Audit)
            </Label>
            <Textarea 
              placeholder="Describe what steps were taken to resolve this feedback..."
              value={formData.action_taken || ""} 
              onChange={(e) => setFormData({...formData, action_taken: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};