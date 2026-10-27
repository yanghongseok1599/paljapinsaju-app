import { Toaster } from "@/components/ui/sonner";
import { Noto_Sans_KR, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import "../globals.css";

import { ClientWidgets } from "@/components/shared/ClientWidgets";
import { COMPANY } from "@/lib/legal/company";
import { STAR_SHOP_OPEN } from "@/lib/toss/config";

// Pretendard loaded via CDN in <head> (no npm package, best quality)
// Plus Jakarta Sans — display/headline font
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

// Space Grotesk — label/mono-feel font
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  display: "swap",
});

// NotoSansKR kept for PDF rendering (react-pdf uses it)
const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://saju.heavendaily-kor.com";

  return {
    title: {
      template: "%s | 팔자핀사주",
      default: "팔자핀사주 - 데이터 기반 AI 사주",
    },
    description:
      "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석. 가입 없이 무료로 사주 원국을 바로 확인하세요.",
    metadataBase: new URL(baseUrl),
    // 모든 페이지의 canonical 을 홈으로 두면 하위 페이지가 검색에 잡히지 않는다. 지정하지 않는다.
    authors: [{ name: "팔자핀사주" }],
    creator: "팔자핀사주",
    publisher: COMPANY.name,
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
    keywords: [
      "사주분석",
      "AI 사주",
      "만세력",
      "사주팔자",
      "운세",
      "2026년 운세",
      "팔자핀사주",
      "사주 상담",
      "자미두수",
      "서양점성술",
      "오행 분석",
      "데이터 기반 AI 사주",
      "AI 운세 분석",
    ],
    openGraph: {
      type: "website",
      siteName: "팔자핀사주",
      title: "팔자핀사주 - 데이터 기반 AI 사주",
      description:
        "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석. 가입 없이 무료로 사주 원국을 바로 확인하세요.",
      url: baseUrl,
      locale: "ko_KR",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "팔자핀사주 - 데이터 기반 AI 사주",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "팔자핀사주 - 데이터 기반 AI 사주",
      description:
        "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석. 가입 없이 무료로 사주 원국을 바로 확인하세요.",
      images: [`${baseUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} data-theme="drsaju" suppressHydrationWarning>
      <head>
        {/* Pretendard — primary body/UI font (CDN, best Korean coverage) */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          as="style"
          crossOrigin="anonymous"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        {/* JSON-LD: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "팔자핀사주",
              url: "https://saju.heavendaily-kor.com",
              description:
                "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석 서비스.",
              inLanguage: "ko",
            }),
          }}
        />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: COMPANY.name,
              url: "https://saju.heavendaily-kor.com",
              contactPoint: {
                "@type": "ContactPoint",
                email: COMPANY.email,
                contactType: "customer support",
              },
            }),
          }}
        />
        {/* JSON-LD: Product — 별 상점이 닫혀 있으면 팔지 않는 상품을 검색엔진에 알리지 않는다 */}
        {STAR_SHOP_OPEN && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: "팔자핀사주 별 충전",
                description:
                  "데이터 기반 AI 사주 분석 서비스. 사주팔자 · 자미두수 · 서양점성술 통합 분석.",
                offers: {
                  "@type": "AggregateOffer",
                  lowPrice: "9900",
                  highPrice: "29900",
                  priceCurrency: "KRW",
                  offerCount: 3,
                  availability: "https://schema.org/InStock",
                },
              }),
            }}
          />
        )}
        {/* JSON-LD: FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "팔자핀사주는 어떤 서비스인가요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "팔자핀사주는 사주팔자 · 자미두수 · 서양점성술을 데이터 기반으로 통합 분석하는 AI 사주 서비스입니다. 생년월일시를 입력하면 AI가 성격, 연애, 재물, 직업, 건강 등을 실시간 채팅으로 분석해줍니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "무료로 이용할 수 있나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "네, 가입 없이 무료로 사주 원국 요약을 받아볼 수 있고, 회원가입하면 AI 상담에 쓸 수 있는 별 3개를 드립니다.",
                  },
                },
                ...(STAR_SHOP_OPEN
                  ? [
                      {
                        "@type": "Question",
                        name: "별 충전 가격은 얼마인가요?",
                        acceptedAnswer: {
                          "@type": "Answer",
                          text: "별 30개 9,900원, 별 70개 19,900원, 별 120개 29,900원 세 가지 패키지가 있습니다. 많이 충전할수록 개당 가격이 저렴합니다.",
                        },
                      },
                    ]
                  : []),
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${notoSansKR.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
          <ClientWidgets />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
