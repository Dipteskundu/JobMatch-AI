import { describe, expect, it } from "vitest";
import {
  buildResumeSkillSet,
  isJobOpen,
  normalizeSkills,
  rankJobsForResume,
  scoreJobAgainstSkills,
} from "./jobMatch";

describe("normalizeSkills", () => {
  it("lowercases, trims and de-duplicates skill strings", () => {
    expect(normalizeSkills([" React ", "react", "Node.js", "", 42, null])).toEqual([
      "react",
      "node.js",
    ]);
  });

  it("returns an empty list for non-arrays", () => {
    expect(normalizeSkills(undefined)).toEqual([]);
    expect(normalizeSkills("react")).toEqual([]);
  });
});

describe("buildResumeSkillSet", () => {
  it("merges skills and technologies from the upload payload", () => {
    expect(
      buildResumeSkillSet({ skills: ["React"], technologies: ["Node.js", "react"] }),
    ).toEqual(["react", "node.js"]);
  });

  it("returns an empty list when the payload is missing", () => {
    expect(buildResumeSkillSet(null)).toEqual([]);
  });
});

describe("scoreJobAgainstSkills", () => {
  it("scores required skills proportionally and lists the missing ones", () => {
    const score = scoreJobAgainstSkills(
      { skills: ["React", "Node.js", "GraphQL"], niceToHaveSkills: ["MongoDB"] },
      ["react", "node.js"],
    );

    expect(score.matchScore).toBe(53);
    expect(score.directSkills).toEqual(["react", "node.js"]);
    expect(score.missingSkills).toEqual(["graphql"]);
    expect(score.adjacentSkills).toEqual([]);
    expect(score.directDisplay).toEqual(["React", "Node.js"]);
    expect(score.missingDisplay).toEqual(["GraphQL"]);
    expect(score.totalRequired).toBe(3);
  });

  it("awards the full 100 when every required and nice skill is covered", () => {
    expect(
      scoreJobAgainstSkills(
        { skills: ["React"], niceToHaveSkills: ["Testing"] },
        ["react", "testing"],
      ).matchScore,
    ).toBe(100);
  });

  it("awards 80 when only the required skills are covered", () => {
    expect(
      scoreJobAgainstSkills(
        { skills: ["React"], niceToHaveSkills: ["Testing"] },
        ["react"],
      ).matchScore,
    ).toBe(80);
  });

  it("falls back to 80 + 20 when a job lists no skills", () => {
    expect(scoreJobAgainstSkills({}, ["react"]).matchScore).toBe(100);
  });
});

describe("isJobOpen", () => {
  it("rejects closed jobs and past deadlines", () => {
    expect(isJobOpen({ status: "approved" })).toBe(true);
    expect(isJobOpen({ status: "closed" })).toBe(false);
    expect(isJobOpen({ deadline: "2020-01-01" })).toBe(false);
    expect(isJobOpen({ deadline: "2099-01-01" })).toBe(true);
    expect(isJobOpen(null)).toBe(false);
  });
});

describe("rankJobsForResume", () => {
  const jobs = [
    { _id: "1", title: "Designer", skills: ["Figma"], niceToHaveSkills: [] },
    { _id: "2", title: "Backend Dev", skills: ["Node.js", "MongoDB"], niceToHaveSkills: ["React"] },
    { _id: "3", title: "Frontend Dev", skills: ["React", "CSS"], niceToHaveSkills: ["Node.js"] },
    { _id: "4", title: "Closed Role", skills: ["React"], status: "closed" },
    { _id: "5", title: "Expired Role", skills: ["React"], deadline: "2020-01-01" },
    { _id: "6", title: "No Skills Listed", skills: [] },
  ];

  it("keeps only open jobs sharing at least one skill, best match first", () => {
    const ranked = rankJobsForResume(jobs, ["react", "node.js", "mongodb"]);

    expect(ranked.map((match) => match.job._id)).toEqual(["2", "3"]);
    expect(ranked[0].matchScore).toBeGreaterThanOrEqual(ranked[1].matchScore);
    expect(ranked[0].directDisplay).toContain("Node.js");
  });

  it("returns nothing when the resume has no skills", () => {
    expect(rankJobsForResume(jobs, [])).toEqual([]);
    expect(rankJobsForResume(jobs, undefined)).toEqual([]);
  });

  it("returns nothing when no job shares a skill", () => {
    expect(rankJobsForResume(jobs, ["cobol"])).toEqual([]);
  });
});
