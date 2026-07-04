"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";

interface InventoryLayoutProps {
  children: ReactNode;
}

export default function InventoryLayout({ children }: InventoryLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}