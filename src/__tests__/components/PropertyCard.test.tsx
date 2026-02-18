// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { PropertyCard } from "@/components/card/PropertyCard";
import { CompareProvider } from "@/contexts/CompareContext";
import type { RecommendationItem } from "@/types/api";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<CompareProvider>{ui}</CompareProvider>);
}

const mockItem: RecommendationItem = {
  rank: 1,
  aptId: 100,
  aptName: "\uD14C\uC2A4\uD2B8 \uC544\uD30C\uD2B8",
  address: "\uC11C\uC6B8\uC2DC \uAC15\uB0A8\uAD6C \uC5ED\uC0BC\uB3D9 123",
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
  reason: "\uC608\uC0B0 \uC5EC\uC720 80% + \uD1B5\uADFC\uC2DC\uAC04 \uC591\uD638",
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
    renderWithProviders(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText("\uD14C\uC2A4\uD2B8 \uC544\uD30C\uD2B8")).toBeInTheDocument();
    expect(screen.getByText(/\uC11C\uC6B8\uC2DC \uAC15\uB0A8\uAD6C \uC5ED\uC0BC\uB3D9 123/)).toBeInTheDocument();
  });

  it("displays rank badge with accent for top 3", () => {
    renderWithProviders(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    const rankBadge = screen.getByTestId("rank-badge");
    expect(rankBadge).toHaveTextContent("1");
    expect(rankBadge.className).toContain("bg-[var(--color-accent)]");
  });

  it("displays neutral badge for rank > 3", () => {
    const item4 = { ...mockItem, rank: 4 };
    renderWithProviders(
      <PropertyCard item={item4} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    const rankBadge = screen.getByTestId("rank-badge");
    expect(rankBadge).toHaveTextContent("4");
    expect(rankBadge.className).toContain("bg-[var(--color-neutral-500)]");
  });

  it("shows 4 dimension scores inline", () => {
    renderWithProviders(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText("\uC608\uC0B0")).toBeInTheDocument();
    expect(screen.getByText("\uD1B5\uADFC")).toBeInTheDocument();
    expect(screen.getByText("\uBCF4\uC721")).toBeInTheDocument();
    expect(screen.getByText("\uC548\uC804")).toBeInTheDocument();
  });

  it("shows trade type and price", () => {
    renderWithProviders(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText(/\uC804\uC138/)).toBeInTheDocument();
    expect(screen.getByText(/3\uC5B5 2,000\uB9CC/)).toBeInTheDocument();
  });

  it("shows household count", () => {
    renderWithProviders(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText(/1,200\uC138\uB300/)).toBeInTheDocument();
  });

  it("shows commute time inline with address", () => {
    renderWithProviders(
      <PropertyCard item={mockItem} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    expect(screen.getByText(/\uD83D\uDE8730\uBD84/)).toBeInTheDocument();
  });

  it("shows only commuteTime1 even when commuteTime2 exists", () => {
    const dualCommute = { ...mockItem, commuteTime2: 58 };
    renderWithProviders(
      <PropertyCard item={dualCommute} isSelected={false} onHover={() => {}} onClick={() => {}} />,
    );
    // Compact card only shows commuteTime1
    expect(screen.getByText(/\uD83D\uDE8730\uBD84/)).toBeInTheDocument();
  });
});
