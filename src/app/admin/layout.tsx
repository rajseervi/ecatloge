"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "./_components/AdminSidebar";
import { SidebarProvider } from "./_components/SidebarContext";
import { ReactNode } from "react";
import { ToastProvider } from "./_components/Toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="lg:pl-64 transition-all duration-300 ease-in-out">
              <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  );
}
