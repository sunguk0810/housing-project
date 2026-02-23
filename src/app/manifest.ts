import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "집콕신혼 - 주거 분석 서비스",
    short_name: "집콕신혼",
    description: "신혼부부를 위한 공공데이터 기반 주거 분석 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0891B2",
    orientation: "portrait-primary",
    categories: ["lifestyle", "finance"],
    lang: "ko",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
