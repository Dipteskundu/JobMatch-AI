// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ShareJobButton from "./ShareJobButton";

const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");

function restoreNavigatorProperty(name, descriptor) {
  if (descriptor) {
    Object.defineProperty(navigator, name, descriptor);
  } else {
    delete navigator[name];
  }
}

beforeEach(() => {
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue() },
  });
});

afterEach(() => {
  cleanup();
  restoreNavigatorProperty("share", originalShare);
  restoreNavigatorProperty("clipboard", originalClipboard);
});

describe("ShareJobButton", () => {
  it("uses the native share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });

    render(
      <ShareJobButton
        job={{ _id: "job-1", title: "Frontend Developer", company: "Acme" }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Share Frontend Developer" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Shared");
    expect(share).toHaveBeenCalledWith({
      title: "Frontend Developer",
      text: "Frontend Developer at Acme",
      url: `${window.location.origin}/jobs/job-1`,
    });
  });

  it("copies the job link when the native share sheet is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <ShareJobButton
        job={{ _id: "job-1", title: "Frontend Developer", company: "Acme" }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Share Frontend Developer" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Link copied");
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/jobs/job-1`);
  });
});
