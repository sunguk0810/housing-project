import type { Metadata } from "next";
import { CompareClient } from "@/components/compare/CompareClient";

export const metadata: Metadata = {
  title: "단지 비교 | 집콕신혼",
  description: "선택한 단지들을 상세 비교합니다.",
};

export default function ComparePage() {
  return <CompareClient />;
}
