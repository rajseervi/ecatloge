"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "./_components/AdminSidebar";
import { ReactNode } from "react";
import { ToastProvider } from "./_components/Toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <AdminSidebar />
          <div className="transition-all duration-300 ease-in-out ml-64">
            <main className="p-6">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </ProtectedRoute>
  );
}
