import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { JSX } from "react";

export default function PublicRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);

  if (checking) return null;

  if (user?.role === "Customer") {
    return <Navigate to="/customer/dashboard" replace />;
  }
  if (user?.role === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === "Staff") {
    return <Navigate to="/staff/dashboard" replace />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}