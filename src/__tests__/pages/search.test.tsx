// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => "/search",
}));

// Must import after mocks
const { default: SearchPage } = await import("@/app/(main)/search/page");

describe("SearchPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Skip consent screen (C2: consent moved to Step0)
    sessionStorage.setItem("hc_consent", "true");
    mockPush.mockReset();
  });

  it("renders StepWizard with step 1", () => {
    render(<SearchPage />);
    expect(screen.getByRole("heading", { name: "주거 유형" })).toBeInTheDocument();
    expect(screen.getByText("주거형태와 자녀계획을 선택해주세요")).toBeInTheDocument();
  });

  it("renders trade type options", () => {
    render(<SearchPage />);
    expect(screen.getByText("매매")).toBeInTheDocument();
    expect(screen.getByText("전세")).toBeInTheDocument();
  });

  it("renders child plan options", () => {
    render(<SearchPage />);
    expect(screen.getByText("계획있음")).toBeInTheDocument();
    expect(screen.getByText("고민중")).toBeInTheDocument();
    expect(screen.getByText("없음")).toBeInTheDocument();
  });

  it("has next button", () => {
    render(<SearchPage />);
    expect(screen.getByText("다음")).toBeInTheDocument();
  });

  it("navigates to step 2 on next click", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    await user.click(screen.getByText("다음"));
    expect(screen.getByRole("heading", { name: "직장 위치" })).toBeInTheDocument();
  });
});
