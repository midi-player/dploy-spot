const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Méthode non autorisée" }), { status: 405, headers: jsonHeaders });
    }

    const body = await request.json() as { text?: unknown; era?: unknown };
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 300) : "";
    const era = typeof body.era === "string" ? body.era : "";
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    const voiceId = Deno.env.get(`ELEVENLABS_VOICE_${era}`) ?? Deno.env.get("ELEVENLABS_VOICE_ID");

    if (!text || !apiKey || !voiceId) {
      return new Response(JSON.stringify({ error: "Configuration audio incomplète" }), { status: 400, headers: jsonHeaders });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.45,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "ElevenLabs a refusé la génération audio" }), { status: response.status, headers: jsonHeaders });
    }

    return new Response(await response.arrayBuffer(), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "La génération audio a échoué" }), { status: 500, headers: jsonHeaders });
  }
});
