// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/apiClient", () => ({
  default: { get: vi.fn() },
}));

import api from "../../lib/apiClient";
import ProfileMatchButton from "./ProfileMatchButton";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("ProfileMatchButton", () => {
  it("loads and displays the candidate's actual score", async () => {
    api.get.mockResolvedValue({
      data: { success: true, data: { matchScore: 76 } },
    });

    render(
      <ProfileMatchButton
        jobId="job-1"
        jobTitle="Frontend Developer"
        uid="candidate-1"
        onClick={vi.fn()}
      />,
    );

    expect(await screen.findByText("76%")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/api/jobs/job-1/fit", {
      params: { uid: "candidate-1" },
    });
  });

  it("opens the fit map when the score button is clicked", async () => {
    api.get.mockResolvedValue({
      data: { success: true, data: { matchScore: 76 } },
    });
    const onClick = vi.fn();

    render(
      <ProfileMatchButton
        jobId="job-1"
        jobTitle="Frontend Developer"
        uid="candidate-1"
        onClick={onClick}
      />,
    );

    const button = await screen.findByRole("button", {
      name: /profile match 76 percent/i,
    });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("shows an unavailable state if the score request fails", async () => {
    api.get.mockRejectedValue(new Error("network down"));
    const onClick = vi.fn();

    render(
      <ProfileMatchButton
        jobId="job-1"
        jobTitle="Frontend Developer"
        uid="candidate-1"
        onClick={onClick}
      />,
    );

    const button = await screen.findByRole("button", {
      name: /profile match unavailable/i,
    });
    expect(screen.getByText("—")).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
