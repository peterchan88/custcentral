"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export const SidebarWithAuth = () => {
  const pathname = usePathname();
  
  if (pathname === '/login') {
    return null;
  }

  return <Sidebar />;
};