import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

const projectID = "eighth-azimuth-397102";
const location = "us-central1";
const agentID = "633dcf97-25ec-413f-8a4d-7de3c48c0f2d";
const environmentID = "dc00f583-266f-4caa-8ce9-c5c01cce9205";

// Fungsi untuk mendapatkan access token Google Cloud
async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse?.token;
}

export async function POST(req: NextRequest) {
  try {
    const { text, sessionId } = await req.json();

    if (!text || !sessionId) {
      return NextResponse.json({ message: "text dan sessionId wajib diisi" }, { status: 400 });
    }

    // Dapatkan token otomatis
    const accessToken = await getAccessToken();

    const url = `https://${location}-dialogflow.googleapis.com/v3/projects/${projectID}/locations/${location}/agents/${agentID}/environments/${environmentID}/sessions/${sessionId}:detectIntent`;

    const dialogflowRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        queryInput: {
          text: { text },
          languageCode: "id",
        },
      }),
    });

    if (!dialogflowRes.ok) {
      const errText = await dialogflowRes.text();
      return NextResponse.json({ message: "Dialogflow error", detail: errText }, { status: 500 });
    }

    const data = await dialogflowRes.json();
    const reply =
      data.queryResult?.responseMessages?.[0]?.text?.text?.[0] ||
      data.queryResult?.responseMessages?.[0]?.text?.text ||
      data.queryResult?.responseMessages?.[0]?.text ||
      data.queryResult?.responseMessages?.[0]?.payload?.reply ||
      "Maaf, tidak ada jawaban.";

    return NextResponse.json({ reply, raw: data });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Gagal menghubungi Dialogflow", error: err?.message },
      { status: 500 }
    );
  }
}