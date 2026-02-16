// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { AmountInput } from "@/components/input/AmountInput";

function Wrapper({ initial = 0 }: { initial?: number }) {
  const [value, setValue] = useState(initial);
  return <AmountInput label="자산" value={value} onChange={setValue} />;
}

describe("AmountInput", () => {
  it("renders label and input", () => {
    render(<Wrapper />);
    expect(screen.getByText("자산")).toBeInTheDocument();
  });

  it("displays formatted value", () => {
    render(<Wrapper initial={15000} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("15,000");
  });

  it("handles quick amount button clicks", async () => {
    const user = userEvent.setup();
    render(<Wrapper initial={5000} />);
    await user.click(screen.getByText("+1,000만"));
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("6,000");
  });

  it("prevents negative values from direct input", async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "-500");
    const inputEl = input as HTMLInputElement;
    // Negative sign is stripped, only numeric chars remain
    expect(inputEl.value).not.toContain("-");
  });

  it("shows error message", () => {
    render(<AmountInput label="자산" value={0} onChange={() => {}} error="필수 항목입니다" />);
    expect(screen.getByRole("alert")).toHaveTextContent("필수 항목입니다");
  });
});
