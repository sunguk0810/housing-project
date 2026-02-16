import type { Metadata } from "next";
import { LandingContent } from "@/components/layout/LandingContent";

export const metadata: Metadata = {
  title: "집콕신혼 | 신혼부부 주거 분석 서비스",
  description:
    "소득, 자산, 직장 위치를 기반으로 나에게 맞는 단지를 공공 데이터로 분석합니다.",
};

export default function LandingPage() {
  return <LandingContent />;
}
