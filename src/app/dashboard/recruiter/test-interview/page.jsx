"use client";

import { useAuth } from "@/app/lib/AuthContext";
import RoleGuard from "@/app/components/auth/RoleGuard";

export default function TestInterviewPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["recruiter"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Interview Test Page</h1>
        <p>This is a test page to verify routing works.</p>
        <p>User: {user?.email || "Not logged in"}</p>
        <p>If you can see this page, the interview routing is working!</p>
      </div>
    </RoleGuard>
  );
}
