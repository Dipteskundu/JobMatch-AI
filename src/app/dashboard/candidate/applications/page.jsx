"use client";

import PlaceholderPage from "@/app/components/dashboard/PlaceholderPage";
import RoleGuard from "@/app/components/auth/RoleGuard";

export default function CandidateApplicationsPage() {
  return (
    <RoleGuard allowedRoles={["candidate"]}>
      <PlaceholderPage
        title="My Applications"
        description="Track and manage all your submitted job applications in one place. Detailed status updates and recruiter feedback will appear here."
      />
    </RoleGuard>
  );
}
