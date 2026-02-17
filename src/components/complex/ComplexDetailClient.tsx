"use client";

import { useState } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ExternalLinkCTA } from "@/components/trust/ExternalLinkCTA";
import { DISCLAIMER_TEXTS } from "@/lib/constants";
import { readDetailSession } from "@/lib/detail-session";
import { DetailHero } from "@/components/complex/DetailHero";
import { StickyTabs, type DetailTabKey } from "@/components/complex/StickyTabs";
import { StickyCTA } from "@/components/complex/StickyCTA";
import { OverviewPanel } from "@/components/complex/panels/OverviewPanel";
import { BudgetPanel } from "@/components/complex/panels/BudgetPanel";
import { CommutePanel } from "@/components/complex/panels/CommutePanel";
import { ChildcarePanel } from "@/components/complex/panels/ChildcarePanel";
import { SafetyPanel } from "@/components/complex/panels/SafetyPanel";
import type { ApartmentDetailResponse } from "@/types/api";

interface ComplexDetailClientProps {
  data: ApartmentDetailResponse;
}

function getInitialTab(): DetailTabKey {
  if (typeof window === "undefined") return "overview";
  const hash = window.location.hash.slice(1);
  const valid: ReadonlyArray<DetailTabKey> = ["overview", "budget", "commute", "childcare", "safety"];
  return valid.includes(hash as DetailTabKey) ? (hash as DetailTabKey) : "overview";
}

export function ComplexDetailClient({ data }: ComplexDetailClientProps) {
  const { apartment, nearby, commute, sources } = data;

  useTracking({ name: "concierge_unique_view", aptId: apartment.id });

  const [session] = useState(() => readDetailSession(apartment.id));
  const [activeTab, setActiveTab] = useState<DetailTabKey>(getInitialTab);

  return (
    <div className="mx-auto max-w-3xl px-[var(--space-4)] pb-28 py-[var(--space-6)]">
      <DetailHero
        aptName={apartment.aptName}
        address={apartment.address}
        householdCount={apartment.householdCount}
        builtYear={apartment.builtYear}
        areaMin={apartment.areaMin}
        areaMax={apartment.areaMax}
        session={session}
      />

      <StickyTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-[var(--space-4)]">
        <div
          role="tabpanel"
          id="panel-overview"
          aria-labelledby="tab-overview"
          hidden={activeTab !== "overview"}
        >
          {activeTab === "overview" && (
            <OverviewPanel dimensions={session.dimensions} />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-budget"
          aria-labelledby="tab-budget"
          hidden={activeTab !== "budget"}
        >
          {activeTab === "budget" && (
            <BudgetPanel
              prices={apartment.prices}
              dimensions={session.dimensions}
              priceDate={sources.priceDate}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-commute"
          aria-labelledby="tab-commute"
          hidden={activeTab !== "commute"}
        >
          {activeTab === "commute" && (
            <CommutePanel
              commute={commute}
              session={session}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-childcare"
          aria-labelledby="tab-childcare"
          hidden={activeTab !== "childcare"}
        >
          {activeTab === "childcare" && (
            <ChildcarePanel
              nearby={nearby}
              childcareScore={session.dimensions?.childcare ?? null}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-safety"
          aria-labelledby="tab-safety"
          hidden={activeTab !== "safety"}
        >
          {activeTab === "safety" && (
            <SafetyPanel
              safety={nearby.safety}
              safetyScore={session.dimensions?.safety ?? null}
            />
          )}
        </div>
      </div>

      {/* External link CTA */}
      <div className="mt-[var(--space-6)] mb-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]">
        <ExternalLinkCTA
          href={`https://new.land.naver.com/complexes/${apartment.aptCode}`}
          label="네이버 부동산에서 보기"
          aptId={apartment.id}
        />
      </div>

      {/* Footer disclaimer */}
      <div className="rounded-[var(--radius-s7-md)] bg-[var(--color-surface-elevated)] p-[var(--space-3)] text-center text-[11px] leading-relaxed text-[var(--color-on-surface-muted)]">
        {DISCLAIMER_TEXTS.footer}
      </div>

      {/* Sticky CTA */}
      <StickyCTA
        item={{
          aptId: apartment.id,
          aptName: apartment.aptName,
          finalScore: session.finalScore,
        }}
      />
    </div>
  );
}
