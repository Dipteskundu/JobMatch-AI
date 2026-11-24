// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, authState } = vi.hoisted(() => ({
  push: vi.fn(),
  authState: { user: { uid: "candidate-1" }, loading: false },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("../components/Navbar/Navbar", () => ({
  default: () => <nav aria-label="Site navigation" />,
}));
vi.mock("../components/Footer/Footer", () => ({
  default: () => <footer />,
}));
vi.mock("../lib/AuthContext", () => ({
  useAuth: () => authState,
}));
vi.mock("../lib/apiClient", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  API_BASE: "http://localhost:5001",
}));

import api from "../lib/apiClient";
import ResumePage from "./page";

const uploadPayload = {
  data: {
    skills: ["React"],
    technologies: ["Node.js"],
    experience_years: 3,
    role_titles: ["Frontend Developer"],
  },
};

const matchingJob = {
  _id: "job-1",
  title: "React Developer",
  company: "Acme",
  location: "Dhaka",
  employmentType: "Full-time",
  salary: "$50k",
  skills: ["React", "Testing"],
};

const unrelatedJob = {
  _id: "job-2",
  title: "Data Analyst",
  company: "Beta",
  location: "Remote",
  skills: ["Python"],
};

function chooseResume() {
  const input = document.querySelector('input[type="file"]');
  const file = new File(["%PDF-1.4 fake"], "resume.pdf", { type: "application/pdf" });
  fireEvent.change(input, { target: { files: [file] } });
}

async function uploadAndFindJobs() {
  chooseResume();
  fireEvent.click(screen.getByRole("button", { name: "Upload & Find Jobs" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.user = { uid: "candidate-1" };
  authState.loading = false;
});

// globals are disabled in vitest.config.mjs, so RTL cannot auto-clean.
afterEach(cleanup);

describe("ResumePage job matching", () => {
  it("renders the shared navigation and footer", () => {
    render(<ResumePage />);

    expect(screen.getByRole("navigation", { name: "Site navigation" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("keeps the shared navigation and footer visible while loading", () => {
    authState.loading = true;
    render(<ResumePage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Site navigation" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("shows ranked jobs that share skills with the resume", async () => {
    api.post.mockResolvedValue({ data: uploadPayload });
    api.get.mockResolvedValue({ data: { data: [matchingJob, unrelatedJob] } });

    render(<ResumePage />);
    await uploadAndFindJobs();

    expect(await screen.findByText("1 job matched your resume")).toBeInTheDocument();
    expect(screen.getByText("React Developer")).toBeInTheDocument();
    expect(screen.queryByText("Data Analyst")).not.toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("Matched:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Job" })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/api/jobs");
  });

  it("shows the no-match empty state when no job shares a skill", async () => {
    api.post.mockResolvedValue({ data: uploadPayload });
    api.get.mockResolvedValue({ data: { data: [unrelatedJob] } });

    render(<ResumePage />);
    await uploadAndFindJobs();

    expect(
      await screen.findByText("No match jobs found based on your resume."),
    ).toBeInTheDocument();
    expect(screen.getByText("Upload a different resume")).toBeInTheDocument();
    expect(screen.getByText("Back to Find Jobs")).toBeInTheDocument();
    expect(screen.queryByText("Data Analyst")).not.toBeInTheDocument();
  });

  it("offers a retry when jobs cannot be loaded", async () => {
    api.post.mockResolvedValue({ data: uploadPayload });
    api.get.mockRejectedValue(new Error("network down"));

    render(<ResumePage />);
    await uploadAndFindJobs();

    expect(
      await screen.findByText("Could not load jobs to match against your resume."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry matching/ })).toBeInTheDocument();
  });

  it("returns to the Find Jobs page from the back button", () => {
    render(<ResumePage />);

    fireEvent.click(screen.getByRole("button", { name: /Back to Jobs/ }));
    expect(push).toHaveBeenCalledWith("/jobs");
  });
});
