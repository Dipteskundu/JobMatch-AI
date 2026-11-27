// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

function matchingJobs(count, titlePrefix = "Resume Match") {
  return Array.from({ length: count }, (_, index) => ({
    ...matchingJob,
    _id: `job-${titlePrefix.toLowerCase().replace(/\s/g, "-")}-${index + 1}`,
    title: `${titlePrefix} ${String(index + 1).padStart(2, "0")}`,
  }));
}

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

  it("rejects legacy DOC files", () => {
    render(<ResumePage />);
    const input = document.querySelector('input[type="file"]');
    const file = new File(["legacy resume"], "resume.doc", { type: "application/msword" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("Please upload a PDF, DOCX, or TXT file.")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("enforces the Vercel-safe 4 MiB upload cap", () => {
    render(<ResumePage />);
    const input = document.querySelector('input[type="file"]');
    const file = new File(["x".repeat(4 * 1024 * 1024 + 1)], "resume.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("File size must be 4 MiB or less.")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
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
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      "/api/resume/upload",
      expect.any(FormData),
      expect.any(Object),
    );
    expect(api.get).toHaveBeenCalledWith("/api/jobs");
  });

  it("shows at most eight ranked jobs per page and navigates the remaining results", async () => {
    api.post.mockResolvedValue({ data: uploadPayload });
    api.get.mockResolvedValue({ data: { data: matchingJobs(14) } });

    render(<ResumePage />);
    await uploadAndFindJobs();

    expect(await screen.findByText("14 jobs matched your resume")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resume Match 01" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resume Match 08" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Resume Match 09" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

    const pagination = screen.getByRole("navigation", { name: "Pagination" });
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByRole("heading", { name: "Resume Match 09" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resume Match 14" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Resume Match 08" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(pagination).toHaveAttribute("aria-label", "Pagination");
    expect(screen.getByText(/Showing 9–14 of 14 matched jobs/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(screen.getByRole("heading", { name: "Resume Match 01" })).toBeInTheDocument();
  });

  it("opens a resume-based skill breakdown from the circular match score", async () => {
    api.post.mockResolvedValue({ data: uploadPayload });
    api.get.mockResolvedValue({ data: { data: [matchingJob] } });

    render(<ResumePage />);
    await uploadAndFindJobs();
    fireEvent.click(await screen.findByRole("button", {
      name: /Resume match 60 percent for React Developer/,
    }));

    expect(screen.getByRole("dialog", { name: "React Developer" })).toBeInTheDocument();
    expect(screen.getByText("1 of 2 required skills matched")).toBeInTheDocument();
    expect(screen.getByText("Direct matches")).toBeInTheDocument();
    expect(screen.getByText("Adjacent skills")).toBeInTheDocument();
    expect(screen.getByText("Missing required skills")).toBeInTheDocument();
    expect(screen.getAllByText("Testing")).toHaveLength(2);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith("/api/jobs");

    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Close resume match breakdown",
      }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resets pagination to the first page when a new resume is analyzed", async () => {
    api.post.mockResolvedValue({ data: uploadPayload });
    api.get
      .mockResolvedValueOnce({ data: { data: matchingJobs(10) } })
      .mockResolvedValueOnce({ data: { data: matchingJobs(9, "Second Resume") } });

    render(<ResumePage />);
    await uploadAndFindJobs();
    expect(await screen.findByText("10 jobs matched your resume")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByRole("heading", { name: "Resume Match 10" })).toBeInTheDocument();

    const input = document.querySelector('input[type="file"]');
    const replacement = new File(["replacement"], "replacement.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [replacement] } });

    expect(await screen.findByText("9 jobs matched your resume")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Second Resume 01" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Second Resume 09" })).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1–8 of 9 matched jobs/)).toBeInTheDocument();
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
