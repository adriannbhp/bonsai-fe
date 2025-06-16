import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { invoiceNumber } = await req.json();
    const bonsaiRes = await fetch(
      "https://bonsai-api-1047513137782.asia-southeast2.run.app/api/invoice",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNumber }),
      }
    );
    const data = await bonsaiRes.json();
    return NextResponse.json(data, { status: bonsaiRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Gagal update status invoice", error: err?.message },
      { status: 500 }
    );
  }
}