import { describe, expect, it } from "vitest";
import {
  getResumeProfileImportValues,
  isProfileValueEmpty,
} from "./resumeProfileImport";

describe("getResumeProfileImportValues", () => {
  it("maps structured resume data into editable profile fields", () => {
    expect(getResumeProfileImportValues({
      skills: ["React"],
      technologies: ["Node.js", "React"],
      experience_years: 4,
      role_titles: ["Frontend Engineer"],
      profile: {
        displayName: "  Alex Candidate ",
        experience: [{ company: "Acme", position: "Engineer" }],
        linkedin: " https://linkedin.com/in/alex ",
      },
    })).toEqual({
      displayName: "Alex Candidate",
      title: "Frontend Engineer",
      skills: "React, Node.js",
      yearsOfExperience: 4,
      experience: [{ company: "Acme", position: "Engineer" }],
      linkedin: "https://linkedin.com/in/alex",
    });
  });

  it("omits unavailable details and account identity fields", () => {
    expect(getResumeProfileImportValues({
      displayName: "",
      email: "resume@example.com",
      experience_years: 0,
      skills: [],
    })).toEqual({});
  });
});

describe("isProfileValueEmpty", () => {
  it("treats blank values as empty but preserves populated values", () => {
    expect(isProfileValueEmpty("")).toBe(true);
    expect(isProfileValueEmpty([])).toBe(true);
    expect(isProfileValueEmpty(0)).toBe(true);
    expect(isProfileValueEmpty("Existing value")).toBe(false);
    expect(isProfileValueEmpty([{ position: "Engineer" }])).toBe(false);
  });
});
