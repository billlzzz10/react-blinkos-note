
import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ChatTurn, ApiKeyMode } from '../types'; // Adjusted path
import { MODEL_NAME as DEFAULT_MODEL_NAME } from '../constants'; // Path is now correct

const STREAM_ERROR_MARKER_FRONTEND = "[[STREAM_ERROR_SDK]]";
const STREAM_ERROR_MARKER_BACKEND = "[[STREAM_ERROR]]"; // Marker used by the backend

const getApiBaseUrl = () => {
  return (process.env.REACT_APP_BACKEND_API_URL || '/api');
};

const formatGeminiErrorForFrontend = (error: any, operationName: string, modelUsed: string): string => {
    console.error(`[Frontend Gemini SDK Error - ${operationName} - Model: ${modelUsed}]`, error);
    let message = "เกิดข้อผิดพลาดในการติดต่อกับ Gemini API โดยตรงจาก Frontend";
    if (error && typeof error === 'object') {
        if (error.message) {
            message = error.message;
        }
        // Specific check for safety-related blocks or other structured errors
        if (error.toString && error.toString().includes("blocked")) {
            message = "เนื้อหาที่ร้องขอถูกบล็อกเนื่องจากนโยบายความปลอดภัย";
        } else if (error.message && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission_denied") || error.message.toLowerCase().includes("api_key_invalid") || error.message.toLowerCase().includes("invalid api key") )) {
             message = `API Key ที่ใช้ (${modelUsed}) ไม่ถูกต้องหรือไม่มีสิทธิ์การเข้าถึง โปรดตรวจสอบ API Key ในหน้าการตั้งค่า หรือลองใช้โหมด Server-Default`;
        }
    } else if (typeof error === 'string') {
        // If the error itself is an HTML string, don't re-wrap it extensively.
        // Just ensure it's marked as an error.
        if (error.includes("<") && error.includes(">")) { // Basic HTML check
            return `AI Error (Frontend SDK - ${modelUsed}): ${error}`;
        }
        message = error;
    }
    return `AI Error (Frontend SDK - ${modelUsed}): ${message}`;
};


export async function* generateAiContentStream(
  systemInstruction: string,
  userPrompt: string,
  chatHistory?: ChatTurn[],
  apiKeyMode?: ApiKeyMode,
  customApiKey?: string,
  selectedModel?: string
): AsyncGenerator<string, void, undefined> {
  const modelToUse = selectedModel || DEFAULT_MODEL_NAME;

  if ((apiKeyMode === 'stored' && customApiKey) || (apiKeyMode === 'prompt' && customApiKey)) {
    // Use direct SDK call if mode is 'stored' or 'prompt' AND a customApiKey is provided
    try {
      const ai = new GoogleGenAI({ apiKey: customApiKey });
      const contents = [];
      if (chatHistory && chatHistory.length > 0) {
        chatHistory.forEach(turn => {
          if ((turn.role === 'user' || turn.role === 'model') && turn.text) {
            contents.push({ role: turn.role, parts: [{ text: turn.text }] });
          }
        });
      }
      contents.push({ role: 'user', parts: [{ text: userPrompt }] });
      
      const config: any = {
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ]
      };
      if (systemInstruction && systemInstruction.trim() !== '') {
        config.systemInstruction = systemInstruction;
      }
      
      if (modelToUse === 'gemini-2.5-flash-preview-04-17' && config.thinkingConfig === undefined) {
        // For flash model, if thinkingConfig is not explicitly set (e.g. for low latency), 
        // it defaults to enabled for higher quality. No need to force disable here unless specifically required.
        // config.thinkingConfig = { thinkingBudget: 0 }; 
      }


      const responseStream = await ai.models.generateContentStream({ model: modelToUse, contents, config });

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (typeof chunkText === 'string') {
          yield chunkText;
        }
      }
    } catch (error: any) {
      const formattedError = formatGeminiErrorForFrontend(error, 'generateAiContentStream (SDK)', modelToUse);
      yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">${formattedError}</p>`;
    }
    return;
  } else {
    // Fallback to backend API call for 'server-default' or if key is missing for other modes
    if (apiKeyMode === 'stored' && !customApiKey) {
      yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">AI Error: API Key mode is 'stored' but no API Key is available. Please set your API Key in Settings.</p>`;
      return;
    }
    
    const apiBaseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${apiBaseUrl}/ai/generate-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction, userPrompt, chatHistory, selectedModel: modelToUse, customApiKey: apiKeyMode === 'server-default' ? customApiKey : undefined }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // The backend should ideally send the marker if it's a backend-specific error.
        // If not, we wrap it.
        if (errorText.includes(STREAM_ERROR_MARKER_BACKEND) || errorText.includes(STREAM_ERROR_MARKER_FRONTEND)) {
           yield errorText; // Assume backend already formatted with marker
        } else {
          // Ensure the error from backend is wrapped with our frontend marker for consistent handling
          yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">Error from backend (${modelToUse}): ${response.status} ${response.statusText}. Details: ${errorText}</p>`;
        }
        return;
      }
      if (!response.body) {
        yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">No response body from backend stream (${modelToUse}).</p>`;
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.length > 0) yield buffer;
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        // Check if the buffer itself contains a marked error from backend stream
        if (buffer.includes(STREAM_ERROR_MARKER_BACKEND) || buffer.includes(STREAM_ERROR_MARKER_FRONTEND)) {
          yield buffer; // Pass the error through
          return; // Stop processing further
        }
        yield buffer; buffer = ''; // Yield current processed segment and clear buffer
      }
    } catch (error: any) {
      console.error("[Frontend AI Service Error - generateAiContentStream (Backend Call)]", error);
      yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">Network or parsing error calling backend (${modelToUse}): ${error.message}</p>`;
    }
  }
}

export const generateSubtasksForTask = async (
  taskTitle: string,
  taskCategory: string,
  apiKeyMode?: ApiKeyMode,
  customApiKey?: string,
  selectedModel?: string
): Promise<string[]> => {
  const modelToUse = selectedModel || DEFAULT_MODEL_NAME;

  if ((apiKeyMode === 'stored' && customApiKey) || (apiKeyMode === 'prompt' && customApiKey)) {
    // Use direct SDK call
    try {
      const ai = new GoogleGenAI({ apiKey: customApiKey });
      const systemInstruction = "คุณคือ AI ผู้ช่วยในการจัดการงานที่มีประสิทธิภาพ หน้าที่ของคุณคือช่วยผู้ใช้แบ่งงานหลักออกเป็นงานย่อยๆ ที่สามารถดำเนินการได้ เมื่อได้รับชื่อของงานหลักและประเภทของงาน โปรดสร้างรายการงานย่อย 3-5 รายการที่ชัดเจนและกระชับ แต่ละงานย่อยควรเป็นขั้นตอนที่นำไปสู่การทำงานหลักให้สำเร็จลุล่วง ตอบกลับเป็น JSON array ของสตริงเท่านั้น โดยแต่ละสตริงคืองานย่อยหนึ่งรายการ อย่าใส่คำอธิบายใดๆ นอกเหนือจาก JSON array และไม่ต้องมี Markdown code fences (```json ... ```)";
      const userPromptText = `ชื่องานหลัก: "${taskTitle}"\nประเภท: "${taskCategory || 'ทั่วไป'}"\n\nกรุณาสร้างงานย่อยเป็น JSON array ของสตริง`;
      
      const config: any = {
        systemInstruction,
        responseMimeType: "application/json",
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ]
      };
      if (modelToUse === 'gemini-2.5-flash-preview-04-17') {
        config.thinkingConfig = { thinkingBudget: 0 }; 
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelToUse,
        contents: [{ role: 'user', parts: [{ text: userPromptText }] }],
        config,
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
          console.error(`Frontend SDK AI response for subtasks (model: ${modelToUse}) was not a valid JSON array of strings. Parsed:`, subtasks);
          alert(`AI (Frontend SDK - ${modelToUse}) ส่งผลลัพธ์งานย่อยในรูปแบบที่ไม่ถูกต้อง: ${response.text}`);
          return [];
        }
        return subtasks;
      } catch (e) {
        console.error(`Frontend SDK failed to parse JSON subtasks from AI (model: ${modelToUse}). Raw:`, response.text, "Attempted to parse:", jsonStr);
        alert(`ไม่สามารถแยกวิเคราะห์ JSON จาก AI (Frontend SDK - ${modelToUse}): ${response.text}`);
        return [];
      }
    } catch (error: any) {
      const formattedError = formatGeminiErrorForFrontend(error, 'generateSubtasksForTask (SDK)', modelToUse);
      alert(formattedError);
      return [];
    }
  } else {
    if (apiKeyMode === 'stored' && !customApiKey) {
      alert("AI Error: API Key mode is 'stored' but no API Key is available. Please set your API Key in Settings.");
      return [];
    }
    // Fallback to backend API call
    const apiBaseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${apiBaseUrl}/ai/generate-subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle, taskCategory, selectedModel: modelToUse, customApiKey: apiKeyMode === 'server-default' ? customApiKey : undefined }),
      });

      if (!response.ok) {
        let errorDetails = `Error ${response.status}: ${response.statusText}`;
        try { const errorData = await response.json(); errorDetails = errorData.error || errorData.message || errorDetails; if(errorData.details) errorDetails += ` Details: ${errorData.details}`; } catch (e) { try { const textError = await response.text(); errorDetails = textError || errorDetails; } catch (textE) {} }
        alert(`ไม่สามารถสร้างงานย่อยได้ (Backend Error - ${modelToUse}): ${errorDetails}`);
        return [];
      }
      const subtasks = await response.json();
      if (!Array.isArray(subtasks) || !subtasks.every(s => typeof s === 'string')) {
        console.error(`AI response for subtasks from backend (${modelToUse}) was not a valid JSON array of strings. Parsed:`, subtasks);
        alert(`AI (ผ่าน Backend - ${modelToUse}) ส่งผลลัพธ์งานย่อยในรูปแบบที่ไม่ถูกต้อง`);
        return [];
      }
      return subtasks;
    } catch (error: any) {
      console.error("[Frontend AI Service Error - generateSubtasksForTask (Backend Call)]", error);
      alert(`ไม่สามารถสร้างงานย่อยได้ (Network Error - Backend Call - ${modelToUse}): ${error.message}`);
      return [];
    }
  }
};