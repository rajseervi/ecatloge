"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";
import { ToastProvider } from "@/app/admin/_components/Toast";
import { SidebarProvider } from "@/app/admin/_components/SidebarContext";
import AdminSidebar from "@/app/admin/_components/AdminSidebar";

interface InventoryLayoutProps {
  children: ReactNode;
}

export default function InventoryLayout({ children }: InventoryLayoutProps) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="transition-all duration-300 ease-in-out ml-64">
              <main className="p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  );
}
