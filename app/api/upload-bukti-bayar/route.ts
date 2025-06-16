import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const bonsaiForm = new FormData();
    for (const [key, value] of formData.entries()) {
      bonsaiForm.append(key, value as Blob);
    }

    const bonsaiRes = await fetch(
      "https://bonsai-api-1047513137782.asia-southeast2.run.app/api/upload",
      {
        method: "POST",
        body: bonsaiForm,
      }
    );

    const bonsaiText = await bonsaiRes.text();

    return new NextResponse(bonsaiText, {
      status: bonsaiRes.status,
      headers: { "Content-Type": bonsaiRes.headers.get("content-type") || "text/plain" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Gagal upload ke Bonsai API", error: err?.message },
      { status: 500 }
    );
  }
}