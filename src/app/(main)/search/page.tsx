import type { Metadata } from "next";
import { StepWizard } from "@/components/input/StepWizard";

export const metadata: Metadata = {
  title: "주거 분석 시작 | 집콕신혼",
  description: "소득, 자산, 직장 위치 정보를 입력하고 나에게 맞는 단지를 분석합니다.",
};

export default function SearchPage() {
  return <StepWizard />;
}
