
import { onRequest, Request as FirebaseFunctionsRequest, Response as FirebaseFunctionsResponse } from "firebase-functions/v2/https";
import express, { Request as ExpressRequest, Response as ExpressResponse, Application, NextFunction, RequestHandler } from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app: Application = express();

// Middleware
app.use(cors({ origin: true }));
// Use express.json() directly. It returns RequestHandler.
app.use(express.json());

const DEFAULT_MODEL_NAME_FUNCTIONS = 'gemini-2.5-flash-preview-04-17';
const STREAM_ERROR_MARKER_FUNCTIONS = "[[STREAM_ERROR]]";

const getAiClientFunctions = (apiKeyOverride?: string) => {
  const apiKeyToUse = apiKeyOverride || process.env.GEMINI_APIKEY;
  if (!apiKeyToUse) {
    console.error("Gemini API Key (GEMINI_APIKEY) is not configured in Firebase Functions environment variables and no override was provided.");
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey: apiKeyToUse });
  } catch (e: any) {
    console.error("Failed to initialize GoogleGenAI in Firebase Function:", e.message);
    return null;
  }
};

const handleGeminiErrorFunctions = (error: any, operationName: string, modelUsed: string): string => {
    console.error(`[Firebase Function Gemini SDK Error - ${operationName} - Model: ${modelUsed}]`, error);
    let message = "เกิดข้อผิดพลาดในการติดต่อกับ Gemini API จาก Firebase Function";
    if (error && typeof error === 'object' && error.message) {
        message = error.message;
    }
    if (message.toLowerCase().includes("api key not valid") || message.toLowerCase().includes("permission_denied") || message.toLowerCase().includes("api_key_invalid")) {
        return `AI Error (Firebase Function): API Key ที่ใช้ (${modelUsed}) ไม่ถูกต้องหรือไม่มีสิทธิ์การเข้าถึง`;
    }
    return `AI Error (Firebase Function - ${modelUsed}): ${message}`;
};

app.post('/ai/generate-stream', async (req: ExpressRequest, res: ExpressResponse) => {
  const { systemInstruction, userPrompt, chatHistory, selectedModel, customApiKey } = req.body as {
    systemInstruction?: string;
    userPrompt?: string;
    chatHistory?: { role: string; text: string }[];
    selectedModel?: string;
    customApiKey?: string;
  };
  
  const aiClient = getAiClientFunctions(customApiKey);
  const modelToUse = selectedModel || DEFAULT_MODEL_NAME_FUNCTIONS;

  if (!aiClient) {
    res.write(`${STREAM_ERROR_MARKER_FUNCTIONS}<p class="text-red-400 font-semibold">AI Service Unavailable (Firebase Function: API Key issue).</p>`);
    return res.end();
  }

  try {
    const geminiContents: any[] = []; 
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((turn: { role: string; text: string }) => {
        if ((turn.role === 'user' || turn.role === 'model') && turn.text) {
          geminiContents.push({ role: turn.role, parts: [{ text: turn.text }] });
        }
      });
    }
    if (userPrompt && typeof userPrompt === 'string' && userPrompt.trim() !== '') {
        geminiContents.push({ role: 'user', parts: [{ text: userPrompt }] });
    }
    
    if (geminiContents.length === 0 && !(systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim() !== '')) {
        res.write(`${STREAM_ERROR_MARKER_FUNCTIONS}<p class="text-red-400 font-semibold">AI Service Error (Firebase Function): No content to process.</p>`);
        return res.end();
    }
    
    const genAiConfig: any = {}; 
    if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim() !== '') {
        genAiConfig.systemInstruction = systemInstruction;
    }
     if (modelToUse === 'gemini-2.5-flash-preview-04-17') { 
        // genAiConfig.thinkingConfig = { thinkingBudget: 0 }; // Example: disable thinking for Flash
    }


    console.log(`[Firebase Function AI] Calling Gemini generateContentStream with model: ${modelToUse}`);
    
    const responseStream = await aiClient.models.generateContentStream({
      model: modelToUse,
      contents: geminiContents,
      config: genAiConfig
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (typeof chunkText === 'string') {
        res.write(chunkText);
      }
    }
  } catch (error: any) {
    console.error("Error in /ai/generate-stream Firebase Function:", error);
    const formattedError = handleGeminiErrorFunctions(error, 'generateAiContentStream', modelToUse);
    res.write(`${STREAM_ERROR_MARKER_FUNCTIONS}<p class="text-red-400 font-semibold">${formattedError}</p>`);
  } finally {
    res.end();
  }
});

app.post('/ai/generate-subtasks', async (req: ExpressRequest, res: ExpressResponse) => {
  const { taskTitle, taskCategory, selectedModel, customApiKey } = req.body as {
    taskTitle: string;
    taskCategory?: string;
    selectedModel?: string;
    customApiKey?: string;
  };
  const aiClient = getAiClientFunctions(customApiKey);
  const modelToUse = selectedModel || DEFAULT_MODEL_NAME_FUNCTIONS;

  if (!aiClient) {
    return res.status(503).json({ error: "AI Service Unavailable (Firebase Function: API Key issue)." });
  }

  try {
    const systemInstruction = "คุณคือ AI ผู้ช่วยในการจัดการงานที่มีประสิทธิภาพ หน้าที่ของคุณคือช่วยผู้ใช้แบ่งงานหลักออกเป็นงานย่อยๆ ที่สามารถดำเนินการได้ เมื่อได้รับชื่อของงานหลักและประเภทของงาน โปรดสร้างรายการงานย่อย 3-5 รายการที่ชัดเจนและกระชับ แต่ละงานย่อยควรเป็นขั้นตอนที่นำไปสู่การทำงานหลักให้สำเร็จลุล่วง ตอบกลับเป็น JSON array ของสตริงเท่านั้น โดยแต่ละสตริงคืองานย่อยหนึ่งรายการ อย่าใส่คำอธิบายใดๆ นอกเหนือจาก JSON array และไม่ต้องมี Markdown code fences (```json ... ```)";
    const userPromptText = `ชื่องานหลัก: "${taskTitle}"\nประเภท: "${taskCategory || 'ทั่วไป'}"\n\nกรุณาสร้างงานย่อยเป็น JSON array ของสตริง`;

    const genAiConfig: any = {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
    };
    if (modelToUse === 'gemini-2.5-flash-preview-04-17') { 
        genAiConfig.thinkingConfig = { thinkingBudget: 0 }; 
    }

    console.log(`[Firebase Function AI] Calling Gemini generateContent for subtasks, model: ${modelToUse}`);
    const response = await aiClient.models.generateContent({
      model: modelToUse,
      contents: [{ role: 'user', parts: [{text: userPromptText}]}],
      config: genAiConfig,
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const subtasks = JSON.parse(jsonStr);
      if (!Array.isArray(subtasks) || !subtasks.every(s => typeof s === 'string')) {
        console.error(`Firebase Function AI response for subtasks (model: ${modelToUse}) was not a valid JSON array of strings. Parsed:`, subtasks);
        return res.status(500).json({ error: "AI returned an invalid format for subtasks.", details: response.text });
      }
      res.json(subtasks);
    } catch (e: any) {
      console.error(`Firebase Function failed to parse JSON subtasks from AI (model: ${modelToUse}). Raw:`, response.text, "Attempted to parse:", jsonStr);
      return res.status(500).json({ error: "Failed to parse AI subtask response.", details: response.text });
    }
  } catch (error: any) {
    const formattedError = handleGeminiErrorFunctions(error, 'generateSubtasksForTask', modelToUse);
    console.error(formattedError);
    res.status(500).json({ error: formattedError });
  }
});

export const api = onRequest(
  { region: "asia-southeast1", timeoutSeconds: 60, memory: "256MiB" },
  app 
);
