import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Load remedies grounding database helper
function getRemedies() {
  try {
    const filePath = path.join(process.cwd(), "data", "remedies.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    return [];
  }
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
    const clientApiKey = body.apiKey;
    const clientModelName = body.modelName || "";

    const remedies = getRemedies();

    // 1. Setup Grounding Context based on EOC Fasting and Traditional Remedies
    let groundingSystemPrompt = `
      You are the MinkTilet Bio-Nexus Orchestrator, a wellness assistant for office workers in Addis Ababa, Ethiopia.
      You combine science with traditional Ethiopian wellness and herbs.

      KNOWLEDGE BASE - ETHIOPIAN ANCESTRAL REMEDIES:
      ${JSON.stringify(remedies, null, 2)}

      IMPORTANT CONTEXT:
      - Fasting Mode Active: ${fastingMode ? "YES" : "NO"}
      - If Fasting Mode is active, you must recommend vegan meals (no meat, dairy, eggs) and advise eating after 12:00 PM (midday).
      - Recommending teff injera, shiro wot, and Moringa powder for fasting.
      - Mention locations like Addis Ababa (Bole, Megenagna) and partner wellness services at Kuriftu Resorts (massage, spa).

      OUTPUT FORMAT:
      Your response must be a JSON object with two fields:
      1. "answer": The direct response text.
      2. "logs": An array of strings representing your internal step-by-step reasoning logs.
      
      Example format:
      {
        "answer": "Your wellness recommendation here...",
        "logs": ["[1/4 CLINICIAN] Analyzed...", "[2/4 ELDER] Suggested..."]
      }
      Do not return anything else except this JSON structure.
    `;

    // 2. Resolve and Map API key and Model Name
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    let modelName = clientModelName.trim();

    // Map model names to actual valid AI Studio names
    const normalizedModel = modelName.toLowerCase();
    if (normalizedModel.includes("gemma")) {
      modelName = "gemma-2-27b-it"; // Use valid Gemma 2 model
    } else if (normalizedModel.includes("gemini") || !modelName) {
      modelName = "gemini-1.5-flash"; // Default to Gemini 1.5 Flash
    } else {
      // If user typed some other custom string, fallback to Gemini 1.5 Flash
      modelName = "gemini-1.5-flash";
    }

    if (!apiKey) {
      const fallback = getFallbackResponse(type, payload, fastingMode);
      return NextResponse.json({ ...fallback, success: false });
    }

    // 3. API Integration
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gemma does not support responseMimeType: "application/json" config, only Gemini does
    const isGemini = modelName.startsWith("gemini");
    const generationConfig = isGemini ? { responseMimeType: "application/json" } : {};

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig
    });

    let prompt = "";
    if (type === "bloodwork_pdf") {
      prompt = `A user uploaded a blood test: "${payload}". Explain what is missing and suggest Ethiopian herbs or foods.`;
    } else if (type === "cream_photo") {
      prompt = `A user scanned skincare ingredients: "${payload}". Check for bad chemicals and suggest natural alternatives.`;
    } else if (type === "text_prompt") {
      prompt = `The user says: "${payload}". Respond directly and naturally in simple English.`;
    } else if (type === "audio_prompt") {
      prompt = `The user recorded a voice note: "${payload}". Suggest a wellness plan.`;
    } else {
      prompt = `Hello. Introduce yourself.`;
    }

    const result = await model.generateContent([groundingSystemPrompt, prompt]);
    const responseText = result.response.text();
    
    let parsed = { answer: responseText, logs: ["[SYSTEM] Response received."] };
    
    // Robust JSON extractor for Gemma models
    try {
      const jsonStart = responseText.indexOf("{");
      const jsonEnd = responseText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonContent = responseText.substring(jsonStart, jsonEnd + 1);
        parsed = JSON.parse(jsonContent);
      } else {
        parsed = JSON.parse(responseText);
      }
    } catch (e) {
      // If parsing fails, wrap the raw response text
      parsed = {
        answer: responseText,
        logs: ["[WARNING] Handled text output from model directly."]
      };
    }
    
    return NextResponse.json({ ...parsed, success: true });

  } catch (error) {
    console.error("API Error:", error);
    const fallback = getFallbackResponse(type, payload, fastingMode);
    return NextResponse.json({
      ...fallback,
      success: false,
      logs: [`[ERROR] API Call Failed: ${error.message || "Unknown error"}`]
    });
  }
}

// High-fidelity fallback database for defensive engineering
function getFallbackResponse(type, payload, fastingMode) {
  if (type === "text_prompt") {
    return {
      answer: `### Connection Offline
Could not connect to the AI model.

**How to fix this:**
1. Go to the **Settings** tab.
2. Enter a valid **Google AI Studio API Key**.
3. Use a valid model name (like \`gemini-1.5-flash\`).
4. Click **Save Config** and then **Test Connection**.`,
      logs: [
        "[SYSTEM] API key is missing or invalid. Using local cache."
      ]
    };
  }

  if (type === "bloodwork_pdf") {
    return {
      answer: `### Blood Test Results (Offline Demo)
We read your blood test file:

*   **Stress (Cortisol):** High.
*   **Vitamin D:** Low.

**Suggestions:**
1. Drink **Tsedey Ginger Tea** to help lower stress.
2. ${fastingMode ? "Since Fasting is active, use **Moringa powder** with your vegan meals after 12:00 PM for extra vitamins." : "Get morning sun exposure and eat iron-rich foods."}
3. We recommend booking a massage at **Kuriftu Resorts** to ease body tension.`,
      logs: [
        "[CLINICIAN] Read test. High cortisol and low Vitamin D.",
        `[ELDER] Fasting: ${fastingMode ? "Active" : "Inactive"}. Selected local foods.`
      ]
    };
  }

  if (type === "cream_photo") {
    return {
      answer: `### Skincare Check (Offline Demo)
We checked the ingredients list.

**Warnings:**
*   **Methylparaben:** Harsh chemical preservative.
*   **Triethanolamine:** Can cause skin burns and reactions.

**Suggestions:**
*   Stop using this cream.
*   Use natural local brands like **Helaz Beauty** or **Konjo Beauty** instead.`,
      logs: [
        "[SENTINEL] Harsh chemicals detected in ingredients list.",
        "[ELDER] Suggested local organic alternatives."
      ]
    };
  }

  return {
    answer: `### Wellness Advice
You mentioned feeling tired and sore.

**Suggestions:**
1. Try a **3-minute Breathing Break** to relax.
2. Drink warm water infused with **Tenadam leaves** to help soothe muscles.
3. Try a massage at Kuriftu Resorts.`,
    logs: [
      "[SYSTEM] Triggered offline wellness suggestion.",
      "[ELDER] Selected muscle-easing traditional methods."
    ]
  };
}
