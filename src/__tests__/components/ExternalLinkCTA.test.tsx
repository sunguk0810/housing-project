// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExternalLinkCTA } from "@/components/trust/ExternalLinkCTA";

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, "open", { value: mockOpen, writable: true });

describe("ExternalLinkCTA", () => {
  beforeEach(() => {
    mockOpen.mockReset();
  });

  it("renders button with label", () => {
    render(<ExternalLinkCTA href="https://example.com" label="상세 보기" aptId={1} />);
    expect(screen.getByText("상세 보기")).toBeInTheDocument();
  });

  it("opens disclaimer dialog on click", async () => {
    const user = userEvent.setup();
    render(<ExternalLinkCTA href="https://example.com" label="상세 보기" aptId={1} />);
    await user.click(screen.getByText("상세 보기"));
    expect(screen.getByText("외부 사이트 이동")).toBeInTheDocument();
  });

  it("opens link on proceed", async () => {
    const user = userEvent.setup();
    render(<ExternalLinkCTA href="https://example.com" label="상세 보기" aptId={1} />);
    await user.click(screen.getByText("상세 보기"));
    await user.click(screen.getByText("이동하기"));
    expect(mockOpen).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("closes dialog on cancel", async () => {
    const user = userEvent.setup();
    render(<ExternalLinkCTA href="https://example.com" label="상세 보기" aptId={1} />);
    await user.click(screen.getByText("상세 보기"));
    await user.click(screen.getByText("취소"));
    expect(screen.queryByText("외부 사이트 이동")).not.toBeInTheDocument();
  });
});
