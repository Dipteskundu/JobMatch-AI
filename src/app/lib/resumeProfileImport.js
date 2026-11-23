function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanEntries(value) {
  return Array.isArray(value)
    ? value.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
    : [];
}

export function getResumeProfileImportValues(data = {}) {
  const source = data && typeof data === "object" ? data : {};
  const profile = source.profile && typeof source.profile === "object"
    ? { ...source, ...source.profile }
    : source;
  const skills = [
    ...(Array.isArray(profile.skills) ? profile.skills : []),
    ...(Array.isArray(profile.technologies) ? profile.technologies : []),
  ]
    .map(cleanString)
    .filter(Boolean);
  const years = Number(profile.experience_years);
  const values = {
    displayName: cleanString(profile.displayName),
    title: cleanString(profile.title || profile.role_titles?.[0]),
    location: cleanString(profile.location),
    phone: cleanString(profile.phone),
    bio: cleanString(profile.bio),
    skills: Array.from(new Set(skills)).join(", "),
    yearsOfExperience: Number.isFinite(years) && years > 0 ? years : "",
    experience: cleanEntries(profile.experience),
    education: cleanEntries(profile.education),
    projects: cleanEntries(profile.projects),
    certificates: cleanEntries(profile.certificates),
    linkedin: cleanString(profile.linkedin),
    github: cleanString(profile.github),
    twitter: cleanString(profile.twitter),
    website: cleanString(profile.website),
    portfolioUrl: cleanString(profile.portfolioUrl),
  };

  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => (
      Array.isArray(value) ? value.length > 0 : value !== ""
    )),
  );
}

export function isProfileValueEmpty(value) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "number") return value === 0;
  return !String(value ?? "").trim();
}
