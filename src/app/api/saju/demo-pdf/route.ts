import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { SajuPdf } from "@/lib/saju/pdf/saju-template";
import type { SajuReading } from "@/types/saju";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { reading?: SajuReading };
    const reading = body.reading;

    if (!reading?.name || !reading.full_analysis || !reading.five_elements) {
      return NextResponse.json(
        { error: "Invalid demo reading" },
        { status: 400 },
      );
    }

    const pdfBuffer = await renderToBuffer(SajuPdf({ reading }));
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
