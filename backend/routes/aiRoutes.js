const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const router = express.Router();

const DEFAULT_MODEL_NAME_BACKEND = 'gemini-2.5-flash-preview-04-17';
const STREAM_ERROR_MARKER_BACKEND = "[[STREAM_ERROR]]";

const getAiClient = (apiKeyOverride) => {
  const apiKeyToUse = apiKeyOverride || process.env.API_KEY;
  if (!apiKeyToUse) {
    console.error("API_KEY is not configured on the backend and no override was provided.");
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey: apiKeyToUse });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI on backend:", e.message);
    return null;
  }
};

const handleGeminiErrorBackend = (error, operationName, modelUsed) => {
    console.error(`[Backend Gemini SDK Error - ${operationName} - Model: ${modelUsed}]`, error);
    let message = "เกิดข้อผิดพลาดในการติดต่อกับ Gemini API จาก Backend";
    if (error && typeof error === 'object' && error.message) {
        message = error.message;
    }
    if (message.toLowerCase().includes("api key not valid") || message.toLowerCase().includes("permission_denied") || message.toLowerCase().includes("api_key_invalid")) {
        return `AI Error (Backend): API Key ที่ใช้ (${modelUsed}) ไม่ถูกต้องหรือไม่มีสิทธิ์การเข้าถึง`;
    }
    // Add more specific error checks if needed
    return `AI Error (Backend - ${modelUsed}): ${message}`;
};


router.post('/generate-stream', async (req, res) => {
  const { systemInstruction, userPrompt, chatHistory, selectedModel, customApiKey } = req.body;
  
  const aiClient = getAiClient(customApiKey);
  const modelToUse = selectedModel || DEFAULT_MODEL_NAME_BACKEND;

  if (!aiClient) {
    res.write(`${STREAM_ERROR_MARKER_BACKEND}<p class="text-red-400 font-semibold">AI Service Unavailable on Backend (API Key issue).</p>`);
    return res.end();
  }

  try {
    const geminiContents = [];
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(turn => {
        if ((turn.role === 'user' || turn.role === 'model') && turn.text) {
          geminiContents.push({ role: turn.role, parts: [{ text: turn.text }] });
        }
      });
    }
    geminiContents.push({ role: 'user', parts: [{ text: userPrompt }] });
    
    const genAiConfig = {};
    if (systemInstruction && systemInstruction.trim() !== '') {
        genAiConfig.systemInstruction = systemInstruction;
    }

    console.log(`[Backend AI] Calling Gemini generateContentStream with model: ${modelToUse}`);
    
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
  } catch (error) {
    console.error("Error in /generate-stream backend:", error);
    const formattedError = handleGeminiErrorBackend(error, 'generateAiContentStream', modelToUse);
    res.write(`${STREAM_ERROR_MARKER_BACKEND}<p class="text-red-400 font-semibold">${formattedError}</p>`);
  } finally {
    res.end();
  }
});

router.post('/generate-subtasks', async (req, res) => {
  const { taskTitle, taskCategory, selectedModel, customApiKey } = req.body;
  const aiClient = getAiClient(customApiKey);
  const modelToUse = selectedModel || DEFAULT_MODEL_NAME_BACKEND;

  if (!aiClient) {
    return res.status(503).json({ error: "AI Service Unavailable on Backend (API Key issue)." });
  }

  try {
    const systemInstruction = "คุณคือ AI ผู้ช่วยในการจัดการงานที่มีประสิทธิภาพ หน้าที่ของคุณคือช่วยผู้ใช้แบ่งงานหลักออกเป็นงานย่อยๆ ที่สามารถดำเนินการได้ เมื่อได้รับชื่อของงานหลักและประเภทของงาน โปรดสร้างรายการงานย่อย 3-5 รายการที่ชัดเจนและกระชับ แต่ละงานย่อยควรเป็นขั้นตอนที่นำไปสู่การทำงานหลักให้สำเร็จลุล่วง ตอบกลับเป็น JSON array ของสตริงเท่านั้น โดยแต่ละสตริงคืองานย่อยหนึ่งรายการ อย่าใส่คำอธิบายใดๆ นอกเหนือจาก JSON array และไม่ต้องมี Markdown code fences (```json ... ```)";
    const userPromptText = `ชื่องานหลัก: "${taskTitle}"\nประเภท: "${taskCategory || 'ทั่วไป'}"\n\nกรุณาสร้างงานย่อยเป็น JSON array ของสตริง`;

    console.log(`[Backend AI] Calling Gemini generateContent for subtasks, model: ${modelToUse}`);
    const response = await aiClient.models.generateContent({
      model: modelToUse,
      contents: [{ role: 'user', parts: [{text: userPromptText}]}],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
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
        console.error(`Backend AI response for subtasks (model: ${modelToUse}) was not a valid JSON array of strings. Parsed:`, subtasks);
        return res.status(500).json({ error: "AI returned an invalid format for subtasks.", details: response.text });
      }
      res.json(subtasks);
    } catch (e) {
      console.error(`Backend failed to parse JSON subtasks from AI (model: ${modelToUse}). Raw:`, response.text, "Attempted to parse:", jsonStr);
      return res.status(500).json({ error: "Failed to parse AI subtask response.", details: response.text });
    }
  } catch (error) {
    const formattedError = handleGeminiErrorBackend(error, 'generateSubtasksForTask', modelToUse);
    console.error(formattedError);
    res.status(500).json({ error: formattedError });
  }
});

module.exports = router;
