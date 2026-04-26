import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { JSX } from "react";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);

  if (checking) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}