import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { SajuPdf } from "@/lib/saju/pdf/saju-template";
import type { SajuAnalysis, SajuReading } from "@/types/saju";
import { isValidOrderId } from "@/lib/payments/milestone";


/** 무료로 공개하는 항목만 남기고 나머지는 비운다 */
function freeOnly(a: SajuAnalysis | null): SajuAnalysis | null {
  if (!a) return null;
  return {
    overview: a.overview,
    personality: a.personality,
    // 아래는 유료 항목이라 비운다. 템플릿이 빈 값은 건너뛴다.
    love: "",
    career: "",
    wealth: "",
    health: "",
    yearlyFortune: "",
    monthlyFortune: [],
    luckyElements: { color: "", direction: "", number: "" },
    summary: "",
  };
}

/**
 * 결제사에 주문이 실제로 결제됐는지 물어본다.
 * MILESTONE_API_BASE 가 없으면 확인할 방법이 없으므로 false (= 무료 범위만).
 */
async function verifyOrder(orderId?: string): Promise<boolean> {
  if (!orderId || !isValidOrderId(orderId)) return false;

  const apiBase = process.env.MILESTONE_API_BASE;
  if (!apiBase) return false;

  try {
    const res = await fetch(
      `${apiBase.replace(/\/$/, "")}/api/payment/verify?orderId=${encodeURIComponent(orderId)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { valid?: boolean };
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { reading?: SajuReading; orderId?: string };
    const reading = body.reading;

    if (!reading?.name || !reading.full_analysis || !reading.five_elements) {
      return NextResponse.json(
        { error: "Invalid demo reading" },
        { status: 400 },
      );
    }

    // ⚠️ 결제 확인.
    // 예전에는 요청 본문의 reading 을 그대로 PDF로 만들어, 화면에서 잠긴
    // 유료 항목 15개가 PDF로는 결제 없이 전부 빠져나갔다.
    // orderId 가 없거나 결제사 확인이 안 되면 무료 범위만 담는다.
    const verified = await verifyOrder(body.orderId);

    const safeReading: SajuReading = verified
      ? reading
      : {
          ...reading,
          full_analysis: freeOnly(reading.full_analysis),
        };

    const pdfBuffer = await renderToBuffer(SajuPdf({ reading: safeReading }));
    const filename = `사주분석_${reading.name}_${new Date().toISOString().slice(0, 10)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[saju/demo-pdf] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate demo PDF" },
      { status: 500 },
    );
  }
}
