import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const bonsaiRes = await fetch(
      "https://bonsai-api-1047513137782.asia-southeast2.run.app/api/invoice"
    );
    const data = await bonsaiRes.json();
    return NextResponse.json(data, { status: bonsaiRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Gagal mengambil data invoice", error: err?.message },
      { status: 500 }
    );
  }
}