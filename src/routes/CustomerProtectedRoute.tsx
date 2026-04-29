import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { JSX } from "react";

export default function CustomerProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, checking } = useAuthStore();

  if (checking) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "Customer") {
    return <Navigate to="/" replace />;
  }

  return children;
}