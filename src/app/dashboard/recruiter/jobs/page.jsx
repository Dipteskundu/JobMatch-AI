"use client";

import PlaceholderPage from "@/app/components/dashboard/PlaceholderPage";
import RoleGuard from "@/app/components/auth/RoleGuard";

export default function RecruiterJobsPage() {
  return (
    <RoleGuard allowedRoles={["recruiter"]}>
      <PlaceholderPage
        title="My Posted Jobs"
        description="View and manage all your active and past job postings. You can edit, close, or promote your listings from this view."
      />
    </RoleGuard>
  );
}
