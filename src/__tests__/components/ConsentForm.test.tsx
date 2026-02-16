// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ConsentForm } from "@/components/trust/ConsentForm";
import type { ConsentState } from "@/types/ui";

function Wrapper() {
  const [consent, setConsent] = useState<ConsentState>({
    terms: false,
    privacy: false,
    marketing: false,
  });
  return <ConsentForm consent={consent} onChange={setConsent} />;
}

describe("ConsentForm", () => {
  it("renders all consent items", () => {
    render(<Wrapper />);
    expect(screen.getByText("이용약관 동의")).toBeInTheDocument();
    expect(screen.getByText("개인정보 처리방침 동의")).toBeInTheDocument();
    expect(screen.getByText("마케팅 정보 수신 동의")).toBeInTheDocument();
  });

  it("renders select-all checkbox", () => {
    render(<Wrapper />);
    expect(screen.getByText("전체 동의")).toBeInTheDocument();
  });

  it("toggles individual checkbox", async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const checkboxes = screen.getAllByRole("checkbox");
    // First is select-all, next 3 are individual
    await user.click(checkboxes[1]); // terms
    expect(checkboxes[1]).toHaveAttribute("data-state", "checked");
  });

  it("toggles all checkboxes via select-all", async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]); // select-all
    checkboxes.forEach((cb) => {
      expect(cb).toHaveAttribute("data-state", "checked");
    });
  });

  it("shows required/optional badges", () => {
    render(<Wrapper />);
    const requiredBadges = screen.getAllByText("[필수]");
    const optionalBadges = screen.getAllByText("[선택]");
    expect(requiredBadges).toHaveLength(2);
    expect(optionalBadges).toHaveLength(1);
  });
});
