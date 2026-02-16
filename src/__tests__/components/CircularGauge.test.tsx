// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { CircularGauge } from "@/components/score/CircularGauge";

describe("CircularGauge", () => {
  it("renders SVG with correct score text", () => {
    render(<CircularGauge score={75} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("applies card size dimensions by default", () => {
    render(<CircularGauge score={50} />);
    const gauge = screen.getByRole("img");
    expect(gauge).toHaveStyle({ width: "64px", height: "64px" });
  });

  it("applies hero size dimensions", () => {
    render(<CircularGauge score={50} size="hero" />);
    const gauge = screen.getByRole("img");
    expect(gauge).toHaveStyle({ width: "96px", height: "96px" });
  });

  it("applies mini size dimensions", () => {
    render(<CircularGauge score={50} size="mini" />);
    const gauge = screen.getByRole("img");
    expect(gauge).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("has correct aria-label with score and grade", () => {
    render(<CircularGauge score={85} />);
    const gauge = screen.getByRole("img");
    expect(gauge).toHaveAttribute("aria-label", expect.stringContaining("85"));
    expect(gauge).toHaveAttribute("aria-label", expect.stringContaining("A+"));
  });

  it("clamps visual arc but displays raw score", () => {
    // Raw score (150) is displayed as text; only the SVG arc is clamped to 100%
    render(<CircularGauge score={150} />);
    expect(screen.getByText("150")).toBeInTheDocument();
    const progress = screen.getByTestId("gauge-progress");
    const dashOffset = progress.getAttribute("stroke-dashoffset");
    // At 100% (clamped), dashOffset should be 0
    expect(Number(dashOffset)).toBe(0);
  });
});
