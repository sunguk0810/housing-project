import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  title: '집콕신혼',
  description: '신혼부부를 위한 주거 분석 서비스',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY ?? '';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: 'var(--font-sans)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {KAKAO_APP_KEY && (
          <>
            <Script
              src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`}
              strategy="afterInteractive"
            />
            <Script
              src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}
