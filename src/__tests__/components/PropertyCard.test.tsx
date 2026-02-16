// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { PropertyCard } from "@/components/card/PropertyCard";
import type { RecommendationItem } from "@/types/api";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockItem: RecommendationItem = {
  rank: 1,
  aptId: 100,
  aptName: "테스트 아파트",
  address: "서울시 강남구 역삼동 123",
  lat: 37.5,
  lng: 127.0,
  tradeType: "jeonse",
  averagePrice: 32000,
  householdCount: 1200,
  areaMin: 84,
  monthlyCost: 3000,
  commuteTime1: 30,
  commuteTime2: null,
  childcareCount: 5,
  schoolScore: 70,
  safetyScore: 0.8,
  finalScore: 75.5,
  reason: "예산 여유 80% + 통근시간 양호",
  whyNot: null,
  dimensions: {
    budget: 0.8,
    commute: 0.7,
    childcare: 0.5,
    safety: 0.6,
    school: 0.7,
  },
  sources: {
    priceDate: "2026-01",
    safetyDate: "2025-12",
  },
};

describe("PropertyCard", () => {
  it("renders apartment name and address", () => {
    render(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText("테스트 아파트")).toBeInTheDocument();
    expect(screen.getByText(/서울시 강남구 역삼동 123/)).toBeInTheDocument();
  });

  it("displays rank badge with accent for top 3", () => {
    render(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    const rankBadge = screen.getByTestId("rank-badge");
    expect(rankBadge).toHaveTextContent("1");
    expect(rankBadge.className).toContain("bg-[var(--color-accent)]");
  });

  it("displays neutral badge for rank > 3", () => {
    const item4 = { ...mockItem, rank: 4 };
    render(
      <PropertyCard item={item4} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    const rankBadge = screen.getByTestId("rank-badge");
    expect(rankBadge).toHaveTextContent("4");
    expect(rankBadge.className).toContain("bg-[var(--color-neutral-500)]");
  });

  it("shows all 5 dimension scores including school", () => {
    render(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText("예산")).toBeInTheDocument();
    expect(screen.getByText("통근")).toBeInTheDocument();
    expect(screen.getByText("보육")).toBeInTheDocument();
    expect(screen.getByText("안전")).toBeInTheDocument();
    expect(screen.getByText("학군")).toBeInTheDocument();
  });

  it("shows trade type and price", () => {
    render(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText(/전세/)).toBeInTheDocument();
    expect(screen.getByText(/3억 2,000만/)).toBeInTheDocument();
  });

  it("shows household count and area", () => {
    render(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText(/1,200세대/)).toBeInTheDocument();
    expect(screen.getByText(/84㎡/)).toBeInTheDocument();
  });

  it("shows commute time", () => {
    render(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText(/통근 30분/)).toBeInTheDocument();
  });

  it("shows dual commute times when commuteTime2 exists", () => {
    const dualCommute = { ...mockItem, commuteTime2: 58 };
    render(
      <PropertyCard item={dualCommute} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText(/직장1 30분 · 직장2 58분/)).toBeInTheDocument();
  });
});
