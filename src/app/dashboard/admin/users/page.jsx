"use client";

import PlaceholderPage from "@/app/components/dashboard/PlaceholderPage";
import RoleGuard from "@/app/components/auth/RoleGuard";

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <PlaceholderPage
        title="User Management"
        description="Manage all platform users, including candidates, recruiters, and other admins. You can verify profiles and handle account-related issues."
      />
    </RoleGuard>
  );
}
