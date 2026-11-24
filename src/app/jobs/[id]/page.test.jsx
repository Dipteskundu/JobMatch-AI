// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "job-1" }),
  useRouter: () => ({ push }),
}));
vi.mock("../../lib/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "candidate-1" },
    role: "candidate",
    isAuthenticated: true,
    loading: false,
  }),
}));
vi.mock("../../lib/apiClient", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  API_BASE: "http://localhost:5001",
}));
vi.mock("../../components/Navbar/Navbar", () => ({ default: () => null }));
vi.mock("../../components/Footer/Footer", () => ({ default: () => null }));

import api from "../../lib/apiClient";
import JobDetailsPage from "./page";

const job = {
  _id: "job-1",
  title: "Frontend Developer",
  company: "Acme",
  location: "Remote",
  employmentType: "Full-time",
  salary: "$80,000",
  status: "approved",
  skills: ["React"],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ data: { data: job } });
});

afterEach(cleanup);

describe("JobDetailsPage actions", () => {
  it("shows a share action at the top and one apply action after Required Skills", async () => {
    render(<JobDetailsPage />);

    const requiredSkills = await screen.findByText("Required Skills");
    const shareButton = screen.getByRole("button", {
      name: "Share Frontend Developer",
    });
    const saveButton = screen.getByRole("button", { name: "Save job" });
    const applyButtons = screen.getAllByRole("button", { name: "Apply Now" });

    expect(applyButtons).toHaveLength(1);
    expect(shareButton.parentElement).toBe(saveButton.parentElement);
    expect(shareButton.parentElement).toHaveClass(
      "col-start-2",
      "row-start-1",
      "sm:ml-auto",
    );
    expect(
      screen.getByRole("heading", { name: "Frontend Developer" }).parentElement,
    ).toHaveClass("col-span-2", "row-start-2", "sm:flex-1");
    expect(
      shareButton.compareDocumentPosition(requiredSkills) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      requiredSkills.compareDocumentPosition(applyButtons[0]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
