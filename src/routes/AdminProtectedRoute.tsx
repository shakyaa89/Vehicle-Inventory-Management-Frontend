import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { JSX } from "react";

export default function AdminProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, checking } = useAuthStore();

  if (checking) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}