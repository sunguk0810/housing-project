// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { ScoreBar } from "@/components/score/ScoreBar";

describe("ScoreBar", () => {
  it("renders label and score", () => {
    render(<ScoreBar label="예산" score={72} />);
    expect(screen.getByText("예산")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("sets fill width as percentage", () => {
    render(<ScoreBar label="통근" score={60} />);
    const fill = screen.getByTestId("score-bar-fill");
    expect(fill).toHaveStyle({ width: "60%" });
  });

  it("renders compact height", () => {
    render(<ScoreBar label="안전" score={50} compact />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveStyle({ height: "6px" });
  });

  it("renders normal height by default", () => {
    render(<ScoreBar label="학군" score={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveStyle({ height: "8px" });
  });

  it("has correct aria attributes", () => {
    render(<ScoreBar label="보육" score={45} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "45");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });
});
