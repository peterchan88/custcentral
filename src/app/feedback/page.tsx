"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDetailDrawer } from "@/components/feedback/detail-drawer";

export default function FeedbackCentral() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (data) setFeedback(data);
  };

  const filtered = feedback.filter(f => 
    f.customer_id.toLowerCase().includes(search.toLowerCase()) ||
    f.original_feedback.toLowerCase().includes(search.toLowerCase())
  );

  const getSeverityColor = (sev: number) => {
    if (sev >= 5) return "bg-red-100 text-red-700 border-red-200";
    if (sev >= 3) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback Central</h1>
          <p className="text-slate-500 text-sm mt-1">Audit, triage, and manage all incoming customer sentiment records.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search ID or content..." 
              className="pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-slate-50">
                <TableCell className="font-medium">{item.customer_id}</TableCell>
                <TableCell className="capitalize">{item.source_channel}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={item.sentiment === 'negative' ? 'text-red-600' : item.sentiment === 'positive' ? 'text-emerald-600' : ''}>
                    {item.sentiment}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{item.category.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{item.assignee}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedItem(item)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedItem && (
        <FeedbackDetailDrawer 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onUpdate={fetchFeedback}
        />
      )}
    </div>
  );
}