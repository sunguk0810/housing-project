"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ reset }: ErrorProps) {
  return (
    <html lang="ko">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            오류가 발생했습니다
          </h2>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>
            페이지를 불러오는 중 문제가 발생했습니다.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: "#4F46E5",
              color: "white",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
