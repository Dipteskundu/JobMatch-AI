// Client-side resume → job matching.
// Mirrors the server Fit engine (routes/transparency.routes.js):
// 80% from required skills, 20% from nice-to-have skills.

/** Lowercase, trim and de-duplicate a list of skill strings. */
export function normalizeSkills(list) {
  if (!Array.isArray(list)) return [];
  return Array.from(
    new Set(
      list
        .map((skill) => (typeof skill === "string" ? skill.trim().toLowerCase() : ""))
        .filter(Boolean),
    ),
  );
}

/** Build the normalized skill set the server extracted from an uploaded resume. */
export function buildResumeSkillSet(result) {
  const source = result && typeof result === "object" ? result : {};
  return normalizeSkills([
    ...(Array.isArray(source.skills) ? source.skills : []),
    ...(Array.isArray(source.technologies) ? source.technologies : []),
  ]);
}

/** Keep original casing for display, aligned with the normalized lists. */
function displaySkills(original, normalized) {
  if (!Array.isArray(original)) return [];
  const wanted = new Set(normalized);
  return original.filter(
    (skill) => typeof skill === "string" && wanted.has(skill.trim().toLowerCase()),
  );
}

/** Score one job against a normalized resume skill set (0-100). */
export function scoreJobAgainstSkills(job, resumeSkills) {
  const source = job && typeof job === "object" ? job : {};
  const candidate = normalizeSkills(resumeSkills);
  const required = normalizeSkills(source.skills);
  const niceToHave = normalizeSkills(source.niceToHaveSkills);

  const directSkills = required.filter((skill) => candidate.includes(skill));
  const missingSkills = required.filter((skill) => !candidate.includes(skill));
  const adjacentSkills = niceToHave.filter((skill) => candidate.includes(skill));

  const requiredScore =
    required.length > 0 ? (directSkills.length / required.length) * 80 : 80;
  const niceScore =
    niceToHave.length > 0 ? (adjacentSkills.length / niceToHave.length) * 20 : 20;

  return {
    matchScore: Math.round(requiredScore + niceScore),
    directSkills,
    adjacentSkills,
    missingSkills,
    directDisplay: displaySkills(source.skills, directSkills),
    adjacentDisplay: displaySkills(source.niceToHaveSkills, adjacentSkills),
    missingDisplay: displaySkills(source.skills, missingSkills),
    totalRequired: required.length,
  };
}

/** Jobs that are still actionable (not closed, not past the application deadline). */
export function isJobOpen(job) {
  if (!job || typeof job !== "object") return false;
  if (job.status === "closed") return false;
  if (job.deadline && new Date(job.deadline) < new Date()) return false;
  return true;
}

/**
 * Rank open jobs against a resume: keeps only jobs sharing at least one
 * required or nice-to-have skill, best match first.
 */
export function rankJobsForResume(jobs, resumeSkills) {
  const candidate = normalizeSkills(resumeSkills);
  if (candidate.length === 0 || !Array.isArray(jobs)) return [];

  return jobs
    .filter(isJobOpen)
    .map((job) => ({ job, ...scoreJobAgainstSkills(job, candidate) }))
    .filter((match) => match.directSkills.length > 0 || match.adjacentSkills.length > 0)
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        b.directSkills.length - a.directSkills.length ||
        String(a.job?.title || "").localeCompare(String(b.job?.title || "")),
    );
}
