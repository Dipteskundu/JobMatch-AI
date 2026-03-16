export const assistantQuickActions = [
  {
    label: "Find jobs",
    href: "/jobs",
    description: "Search open roles and filter opportunities.",
  },
  {
    label: "Upload resume",
    href: "/resume",
    description: "Add your resume for profile improvement.",
  },
  {
    label: "Skill gap detection",
    href: "/skill-gap-detection",
    description: "Compare your profile with target job requirements.",
  },
  {
    label: "Take skill test",
    href: "/skill-test",
    description: "Assess your current skill level.",
  },
  {
    label: "Open dashboard",
    href: "/dashboard",
    description: "Review matches, activity, and recruiter tools.",
  },
  {
    label: "Browse companies",
    href: "/companies",
    description: "Explore employers and company details.",
  },
  {
    label: "Edit profile",
    href: "/profile",
    description: "Update your account and candidate details.",
  },
];

export const assistantPrompts = [
  "Help me find jobs",
  "Where can I upload my resume?",
  "How do I check my skill gap?",
  "Show me recruiter tools",
];

export const assistantQuickActionsByRole = {
  guest: assistantQuickActions,
  candidate: assistantQuickActions,
  recruiter: [
    {
      label: "Recruiter dashboard",
      href: "/dashboard",
      description: "Manage jobs and applicants.",
    },
    {
      label: "Browse jobs",
      href: "/jobs",
      description: "Review current job listings.",
    },
    {
      label: "Browse companies",
      href: "/companies",
      description: "Explore company profiles.",
    },
    {
      label: "Profile settings",
      href: "/profile",
      description: "Update recruiter profile.",
    },
  ],
};

export function determineRole(user) {
  if (!user) return "guest";

  const explicitRole = String(user?.role || "").toLowerCase();
  if (explicitRole === "recruiter" || explicitRole === "candidate") {
    return explicitRole;
  }

  if (typeof window !== "undefined") {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "recruiter" || storedRole === "candidate") {
      return storedRole;
    }
  }

  const email = String(user?.email || "").toLowerCase();
  if (
    email.includes("recruit") ||
    email.includes("hr") ||
    email.includes("company")
  ) {
    return "recruiter";
  }

  return "candidate";
}
