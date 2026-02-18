import { notFound } from "next/navigation";
import { ComplexDetailClient } from "@/components/complex/ComplexDetailClient";
import { getApartmentDetail } from "@/lib/data/apartment";

export const revalidate = 3600; // ISR: 1 hour

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const aptId = Number(id);
  if (!Number.isInteger(aptId) || aptId <= 0) {
    return { title: "단지 상세 | 집콕신혼" };
  }
  const data = await getApartmentDetail(aptId);
  return {
    title: data ? `${data.apartment.aptName} | 집콕신혼` : "단지 상세 | 집콕신혼",
    description: data
      ? `${data.apartment.aptName} 분석 정보. 공공데이터 기반 참고 정보입니다. 부동산 거래를 중개하지 않습니다.`
      : "공공데이터 기반 참고 정보입니다. 부동산 거래를 중개하지 않습니다.",
  };
}

export default async function ComplexDetailPage({ params }: PageProps) {
  const { id } = await params;
  const aptId = Number(id);
  if (!Number.isInteger(aptId) || aptId <= 0) {
    notFound();
  }

  const data = await getApartmentDetail(aptId);

  if (!data) {
    notFound();
  }

  return <ComplexDetailClient data={data} />;
}
