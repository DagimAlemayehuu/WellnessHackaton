import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MODEL = "gemma-4-31b-it";
const API_KEY = process.env.GEMINI_API_KEY;

function getRemedies() {
  try {
    const filePath = path.join(process.cwd(), "data", "remedies.json");
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

// Extract ONLY what's inside <reply>...</reply> tags.
// If the model outputs thinking before the tag, we throw it all away.
// If no tag found, fall back to stripping known thinking patterns.
function extractReply(raw) {
  // Primary: grab content between <reply> tags
  const tagMatch = raw.match(/<reply>([\s\S]*?)<\/reply>/i);
  if (tagMatch) return tagMatch[1].trim();

  // Fallback: strip obvious thinking lines and return remainder
  const stripped = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    // Remove any line that starts with "* " followed by a capital word (draft/reasoning lines)
    .replace(/^\*\s+[A-Z][^\n]*/gm, "")
    // Remove "* *Draft N*" style lines
    .replace(/^\*\s*\*[^\n]*/gm, "")
    // Remove lines that look like internal plan steps
    .replace(/^\s*[-–]\s*(Draft|Step|Thought|Plan|Greeting|Approach|Reasoning|Tone|Analysis|Value|Call)[^\n]*/gim, "")
    .replace(/^(Assistant:|MinkTilet:)\s*/i, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return stripped;
}

export async function POST(req) {
  let type = "text_prompt";
  let payload = "";
  let fastingMode = false;

  try {
    const body = await req.json();
    type = body.type || "text_prompt";
    payload = body.payload || "";
    fastingMode = body.fastingMode || false;
    const isHewCertified = body.isHewCertified || false;
    const imageData = body.imageData || null;
    const imageMime = body.imageMime || "image/jpeg";
    const clientApiKey = body.apiKey || "";
    const effectiveApiKey = clientApiKey || API_KEY;

    if (!effectiveApiKey) {
      return NextResponse.json({ answer: "No API key configured.", success: false, logs: ["[ERROR] Missing GEMINI_API_KEY"] });
    }

    const remedies = getRemedies();

    // System prompt: forces model to put ONLY the final answer in <reply> tags
    const systemPrompt = `You are MinkTilet — a warm, friendly wellness coach for office workers in Addis Ababa, Ethiopia.
You know Ethiopian herbs: ${remedies.map(r => r.name).join(", ")}.${fastingMode ? "\nFasting Mode ON: vegan meals only, eating after 12 PM." : ""}
Partners: Kuriftu Spa in Addis Ababa.${isHewCertified ? "\nCLINICAL AI MODE ACTIVATED: You are speaking to a certified Health Extension Worker (HEW). Include professional medical observations (like ICD-11 reference codes or diagnostic indices) and precise clinical dosing/application suggestions for any herbs. Keep it professional yet accessible." : ""}

RULES:
- Be conversational and brief. Like texting a knowledgeable friend.
- Greetings → 1 warm sentence.
- Health questions → 2-3 sentences max. No lists unless asked.
- You MUST output your final reply wrapped in <reply> and </reply> tags.
- Do NOT put anything outside the <reply> tags in your output.
- Example: <reply>Selam! I'm here to help with your wellness today. 😊</reply>`;

    let userPrompt = "";
    if (type === "bloodwork_pdf") {
      userPrompt = `Analyze this blood test — 3 brief key findings with Ethiopian herb suggestions:\n"${payload.substring(0, 2000)}"`;
    } else if (type === "cream_photo") {
      userPrompt = `Check these skincare ingredients briefly:\n"${payload}"`;
    } else if (type === "audio_prompt") {
      userPrompt = `Voice note from user: "${payload}". Give a short, warm response.`;
    } else if (type === "webcam_posture") {
      userPrompt = imageData
        ? "Look at this image. In 1-2 casual sentences: is their posture good or bad, and the main tip?"
        : `Posture note: "${payload}". Quick tip in 1-2 sentences.`;
    } else {
      userPrompt = `${payload}`;
    }

    const genAI = new GoogleGenerativeAI(effectiveApiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    let contentParts;
    if (imageData && type === "webcam_posture") {
      contentParts = [userPrompt, { inlineData: { data: imageData, mimeType: imageMime } }];
    } else {
      contentParts = [userPrompt];
    }

    const result = await model.generateContent(contentParts);
    const raw = result.response.text();
    const clean = extractReply(raw);

    return NextResponse.json({ answer: clean, success: true, logs: [`[${MODEL}] OK`] });

  } catch (error) {
    console.error("API Error:", error);

    let errorMsg = error.message || "Unknown error";
    if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
      errorMsg = "Invalid API key.";
    } else if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota")) {
      errorMsg = "API quota exceeded. Try again shortly.";
    } else if (errorMsg.includes("NOT_FOUND") || errorMsg.includes("not found")) {
      errorMsg = "Model not found.";
    }

    return NextResponse.json({
      ...getFallback(type, fastingMode),
      success: false,
      logs: [`[ERROR] ${errorMsg}`],
    });
  }
}

function getFallback(type, fastingMode) {
  if (type === "bloodwork_pdf") return { answer: `High Cortisol → try **Tsedey Ginger Tea** before bed. ${fastingMode ? "Add **Moringa powder** to your 12 PM meal." : "Low Vitamin D → 15 min of morning sun."}` };
  if (type === "cream_photo") return { answer: "**Methylparaben** detected — swap for **Tej Honey** or a local brand like Helaz Beauty." };
  if (type === "webcam_posture") return { answer: "Sit up straight, relax your shoulders, screen at eye level. 😊" };
  return { answer: "Selam! I'm MinkTilet, your wellness coach. What's on your mind today?" };
}
