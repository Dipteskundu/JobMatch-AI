"use client";

import PlaceholderPage from "@/app/components/dashboard/PlaceholderPage";
import RoleGuard from "@/app/components/auth/RoleGuard";

export default function RecruiterApplicantsPage() {
  return (
    <RoleGuard allowedRoles={["recruiter"]}>
      <PlaceholderPage
        title="Job Applicants"
        description="Review all candidates who have applied to your jobs. Use AI-powered sorting and filtering to find the best matches quickly."
      />
    </RoleGuard>
  );
}
