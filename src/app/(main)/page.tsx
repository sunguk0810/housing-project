import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { StepsSection } from "@/components/landing/StepsSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { PreviewSection } from "@/components/landing/PreviewSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { TrackingPixel } from "@/components/landing/TrackingPixel";

export const metadata: Metadata = {
  title: "집콕신혼 | 신혼부부 주거 분석 서비스",
  description:
    "예산·통근·보육·안전, 4가지 관점으로 신혼부부 맞춤 동네를 데이터로 분석합니다.",
};

export default function LandingPage() {
  return (
    <>
      <TrackingPixel />
      <HeroSection />
      <ProblemSection />
      <StepsSection />
      <CategoriesSection />
      <PreviewSection />
      <TrustSection />
      <FinalCTASection />
    </>
  );
}
