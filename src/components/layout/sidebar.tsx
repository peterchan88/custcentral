"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, PlusCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Feedback Central", icon: MessageSquare, href: "/feedback" },
    { label: "Ingest Feedback", icon: PlusCircle, href: "/ingest" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800">
      <div className="p-6 flex items-center gap-2">
        <ShieldCheck className="w-8 h-8 text-blue-400" />
        <h1 className="text-xl font-bold tracking-tight">CustCentral</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
              pathname === route.href 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <route.icon className="w-5 h-5" />
            {route.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">AI Disclaimer</div>
        <p className="text-[10px] text-slate-400 leading-tight">
          AI-generated outputs may contain errors. Human review is recommended for critical decisions.
        </p>
      </div>
    </div>
  );
};