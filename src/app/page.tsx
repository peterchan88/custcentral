"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
}

interface StatsState {
  total: number;
  highSeverity: number;
  needsReview: number;
  sentimentData: ChartData[];
  channelData: ChartData[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatsState>({
    total: 0,
    highSeverity: 0,
    needsReview: 0,
    sentimentData: [],
    channelData: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from('feedback').select('*');
    if (data) {
      const highSev = data.filter(f => f.severity >= 4).length;
      const needsRev = data.filter(f => f.status === 'New').length;
      
      const sentiments = data.reduce((acc: Record<string, number>, f) => {
        const key = f.sentiment || 'Unclassified';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const channels = data.reduce((acc: Record<string, number>, f) => {
        const rawName = f.source_channel || 'unknown';
        const formattedName = rawName
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        acc[formattedName] = (acc[formattedName] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: data.length,
        highSeverity: highSev,
        needsReview: needsRev,
        sentimentData: Object.entries(sentiments).map(([name, value]) => ({ name, value: value as number })),
        channelData: Object.entries(channels).map(([name, value]) => ({ name, value: value as number })),
      });
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time performance metrics and high-priority feedback monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Feedback" value={stats.total} icon={MessageSquare} color="text-blue-600" />
        <StatCard title="High Severity" value={stats.highSeverity} icon={AlertCircle} color="text-red-600" />
        <StatCard title="Needs Review" value={stats.needsReview} icon={Clock} color="text-amber-600" />
        <StatCard title="Resolved" value={stats.total - stats.needsReview} icon={CheckCircle} color="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sentiment Distribution</CardTitle></CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Volume by Channel</CardTitle></CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.channelData} 
                layout="vertical"
                margin={{ left: 20, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="name"
                  type="category"
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  width={120}
                />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <Icon className={`w-8 h-8 ${color} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );
}