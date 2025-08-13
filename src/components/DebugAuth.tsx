"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function DebugAuth() {
  const { user, isAuthenticated, isAdmin, isSalesManager, isLoading, isHydrated } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-sm max-w-sm shadow-lg">
      <div className="font-bold mb-2">Auth Debug Info</div>
      <div className="space-y-1">
        <div>Hydrated: {isHydrated ? "✓" : "✗"}</div>
        <div>Loading: {isLoading ? "✓" : "✗"}</div>
        <div>Authenticated: {isAuthenticated ? "✓" : "✗"}</div>
        <div>Admin: {isAdmin ? "✓" : "✗"}</div>
        <div>Sales Manager: {isSalesManager ? "✓" : "✗"}</div>
        <div>User ID: {user?.id || "None"}</div>
        <div>Role: {user?.role || "None"}</div>
        <div>Name: {user?.name || "None"}</div>
        <div>Territory: {user?.territory || "None"}</div>
        <div>Commission: {user?.commission || "None"}</div>
      </div>
    </div>
  );
}