"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDetailDrawer } from "@/components/feedback/detail-drawer";
import { cn } from "@/lib/utils";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function FeedbackCentral() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (data) setFeedback(data);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...feedback].filter(f => 
      (f.customer_id?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (f.original_feedback?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (f.feedback_en?.toLowerCase() || "").includes(search.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [feedback, search, sortConfig]);

  const getSeverityColor = (sev: number) => {
    if (sev >= 5) return "bg-red-100 text-red-700 border-red-200";
    if (sev >= 3) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <TableHead 
      className="cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className={cn(
          "w-3 h-3 transition-colors",
          sortConfig?.key === sortKey ? "text-blue-600" : "text-slate-300"
        )} />
      </div>
    </TableHead>
  );

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
              placeholder="Search IDs or content..." 
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

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Customer ID" sortKey="customer_id" />
              <SortableHeader label="Channel" sortKey="source_channel" />
              <SortableHeader label="Sentiment" sortKey="sentiment" />
              <SortableHeader label="Category" sortKey="category" />
              <SortableHeader label="Severity" sortKey="severity" />
              <SortableHeader label="Status" sortKey="status" />
              <SortableHeader label="Created" sortKey="created_at_source" />
              <SortableHeader label="Updated" sortKey="updated_at" />
              <TableHead className="w-[200px]">English Feedback</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map((item) => (
              <TableRow key={item.id} className="group hover:bg-slate-50/50">
                <TableCell className="font-medium">{item.customer_id}</TableCell>
                <TableCell className="capitalize text-slate-600">{item.source_channel?.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    item.sentiment === 'negative' ? 'text-red-600 border-red-100' : 
                    item.sentiment === 'positive' ? 'text-emerald-600 border-emerald-100' : ''
                  )}>
                    {item.sentiment}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize text-slate-600">{item.category?.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">{item.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {item.created_at_source ? new Date(item.created_at_source).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <p className="text-xs text-slate-500 truncate" title={item.feedback_en}>
                    {item.feedback_en || '-'}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedItem(item)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSorted.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            No feedback records found matching your search.
          </div>
        )}
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