import { NextResponse } from "next/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const APIPASS_URL = "https://api.apipass.dev/v1/chat/completions";
const PROVIDER_TIMEOUT_MS = 12000;

const SYSTEM_PROMPT = `You are SkillMatch AI Assistant for a hiring platform.
Be concise, practical, and friendly.
You can answer basic career and product questions, and guide users to pages.
If user asks platform navigation, suggest relevant routes like:
- /jobs
- /resume
- /skill-gap-detection
- /skill-test
- /dashboard
- /companies
- /profile
If unsure, say what you do know and suggest a next best action.`;

function buildLocalFallback(prompt) {
  const lower = String(prompt).toLowerCase();

  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("hey")
  ) {
    return "Hi! I'm here and ready to help. You can ask about finding jobs, uploading resume, skill tests, or dashboard navigation.";
  }

  if (lower.includes("how are you") || lower.includes("how you")) {
    return "I'm doing well and ready to help. Ask what you want to do in SkillMatch AI, and I'll guide you step-by-step.";
  }

  if (lower.includes("resume")) {
    return "Go to /resume to upload your resume and improve your profile quality.";
  }

  if (lower.includes("test") || lower.includes("assessment")) {
    return "Use /skill-test to assess your current level, then /skill-gap-detection to plan improvements.";
  }

  if (
    lower.includes("job") ||
    lower.includes("apply") ||
    lower.includes("role")
  ) {
    return "Open /jobs to browse roles and apply. You can compare readiness from /skill-gap-detection.";
  }

  return "I can help with jobs, skill tests, skill-gap detection, resume upload, and dashboard navigation.";
}

const withTimeout = async (
  url,
  options = {},
  timeoutMs = PROVIDER_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

async function callApiPass({ prompt, apiKey, model, baseUrl }) {
  const response = await withTimeout(baseUrl || APIPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`ApiPass error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const assistant = (data?.choices?.[0]?.message?.content || "").trim();
  if (!assistant) throw new Error("ApiPass returned empty output");
  return assistant;
}

async function callGemini({ prompt, model, apiKey }) {
  const url = `${GEMINI_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await withTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser question: ${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 700,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Gemini error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const assistant = (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text)
      .filter(Boolean)
      .join("\n") || ""
  ).trim();
  if (!assistant) throw new Error("Gemini returned empty output");
  return assistant;
}

async function callOpenAI({ prompt, model, apiKey }) {
  const response = await withTimeout(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.25,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const assistant = (data?.choices?.[0]?.message?.content || "").trim();
  if (!assistant) throw new Error("OpenAI returned empty output");
  return assistant;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = (body.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 },
      );
    }

    const geminiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    const apiPassKey = process.env.APIPASS_API_KEY;
    const apiPassModel = process.env.APIPASS_MODEL || "gemini-3-flash-preview";
    const apiPassBaseUrl = process.env.APIPASS_BASE_URL || APIPASS_URL;

    if (!apiPassKey && !geminiKey && !openaiKey) {
      return NextResponse.json({
        assistant: buildLocalFallback(prompt),
        provider: "local-fallback",
      });
    }

    if (apiPassKey) {
      try {
        const assistant = await callApiPass({
          prompt,
          model: apiPassModel,
          apiKey: apiPassKey,
          baseUrl: apiPassBaseUrl,
        });
        return NextResponse.json({
          assistant,
          provider: "apipass",
          model: apiPassModel,
        });
      } catch (apiPassError) {
        if (!geminiKey && !openaiKey) {
          return NextResponse.json({
            assistant: buildLocalFallback(prompt),
            provider: "local-fallback",
            warning: apiPassError?.message || "ApiPass request failed",
          });
        }
      }
    }

    const requestedModel = body.model || process.env.GEMINI_MODEL;
    const geminiModelsToTry = [
      requestedModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash-001",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ].filter(Boolean);
    const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (geminiKey) {
      let lastGeminiError = null;

      for (const model of geminiModelsToTry) {
        try {
          const assistant = await callGemini({
            prompt,
            model,
            apiKey: geminiKey,
          });
          return NextResponse.json({ assistant, provider: "gemini", model });
        } catch (geminiError) {
          lastGeminiError = geminiError;
          if (geminiError?.status === 429) break;
          continue;
        }
      }

      if (!openaiKey) {
        return NextResponse.json({
          assistant: buildLocalFallback(prompt),
          provider: "local-fallback",
          warning: lastGeminiError?.message || "Gemini request failed",
        });
      }

      try {
        const assistant = await callOpenAI({
          prompt,
          model: openaiModel,
          apiKey: openaiKey,
        });
        return NextResponse.json({
          assistant,
          provider: "openai",
          model: openaiModel,
        });
      } catch (openaiError) {
        return NextResponse.json({
          assistant: buildLocalFallback(prompt),
          provider: "local-fallback",
          warning: openaiError?.message || "OpenAI fallback failed",
        });
      }
    }

    const assistant = await callOpenAI({
      prompt,
      model: openaiModel,
      apiKey: openaiKey,
    });
    return NextResponse.json({ assistant, provider: "openai" });
  } catch (err) {
    return NextResponse.json({
      assistant: buildLocalFallback(""),
      provider: "local-fallback",
      warning: err.message || String(err),
    });
  }
}
