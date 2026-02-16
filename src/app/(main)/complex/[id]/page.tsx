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
