"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}