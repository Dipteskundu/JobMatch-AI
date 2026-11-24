// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { user, push } = vi.hoisted(() => ({
  user: { uid: "candidate-1", email: "candidate@example.com" },
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("../lib/AuthContext", () => ({
  useAuth: () => ({ user, role: "candidate", isAuthenticated: true }),
}));
vi.mock("../lib/apiClient", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  API_BASE: "http://localhost:5001",
}));
vi.mock("../components/Navbar/Navbar", () => ({ default: () => null }));
vi.mock("../components/Footer/Footer", () => ({ default: () => null }));
vi.mock("../components/form/ApplyModal", () => ({ default: () => null }));
vi.mock("../components/FitMap/FitMapModal", () => ({
  default: ({ job }) => (
    <div role="dialog" aria-label="Job Fit Map">
      {job.title}
    </div>
  ),
}));
vi.mock("../components/common/PageWrapper", () => ({
  default: ({ children }) => <>{children}</>,
}));

import api from "../lib/apiClient";
import JobsPage from "./page";

const job = {
  _id: "job-1",
  title: "Frontend Developer",
  company: "Acme",
  location: "Remote",
  employmentType: "Full-time",
  salary: "$80,000",
  vacancies: 2,
  skills: ["React"],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation((path) => {
    if (path === "/api/jobs") {
      return Promise.resolve({ data: { data: [job] } });
    }
    if (path === "/api/dashboard/candidate/candidate-1") {
      return Promise.resolve({ data: { data: { applications: [] } } });
    }
    if (path === "/api/jobs/job-1/fit") {
      return Promise.resolve({
        data: { success: true, data: { matchScore: 76 } },
      });
    }
    throw new Error(`Unexpected GET request: ${path}`);
  });
});

afterEach(cleanup);

describe("JobsPage fit score action", () => {
  it("shows the profile score and opens the job's Fit Map modal", async () => {
    render(<JobsPage />);

    const scoreButton = await screen.findByRole("button", {
      name: /profile match/i,
    });
    await waitFor(() =>
      expect(scoreButton).toHaveAccessibleName(/profile match 76 percent/i),
    );
    const jobCard = scoreButton.closest(".group.relative");
    const card = within(jobCard);
    const postedText = screen.getByText("Posted Recently");
    const shareButton = screen.getByRole("button", {
      name: "Share Frontend Developer",
    });
    expect(postedText.parentElement).toBe(shareButton.parentElement);
    expect(postedText.parentElement).toHaveClass(
      "w-full",
      "justify-between",
      "md:w-auto",
      "md:justify-end",
    );
    const saveButton = screen.getByRole("button", { name: "Save job" });
    expect(scoreButton.parentElement).toBe(saveButton.parentElement);
    expect(scoreButton.parentElement).toHaveClass(
      "col-start-2",
      "row-start-1",
      "flex-col",
      "md:col-start-3",
      "md:row-span-2",
      "md:flex-row",
    );
    expect(card.getByText("Acme")).toBeInTheDocument();
    expect(card.getByText("Remote")).toBeInTheDocument();
    expect(card.getByText("Full-time")).toBeInTheDocument();
    expect(card.getByText("$80,000")).toBeInTheDocument();
    expect(card.getByText("2 open")).toBeInTheDocument();
    expect(card.getByText("React")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Apply Now" }),
    ).not.toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/api/jobs/job-1/fit", {
      params: { uid: "candidate-1" },
    });

    fireEvent.click(scoreButton);

    expect(await screen.findByRole("dialog", { name: "Job Fit Map" })).toHaveTextContent(
      "Frontend Developer",
    );
  });

  it("renders the AI-matching promo below the job cards on mobile", async () => {
    render(<JobsPage />);

    const jobTitle = await screen.findByRole("heading", {
      name: "Frontend Developer",
    });
    const promoHeadings = screen.getAllByRole("heading", {
      name: "Get AI-Matched",
    });
    const mobilePromo = promoHeadings.find((heading) =>
      heading.closest('[class~="lg:hidden"]'),
    );

    expect(mobilePromo).toBeDefined();
    expect(
      jobTitle.compareDocumentPosition(mobilePromo) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
