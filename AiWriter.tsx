
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Copy, Plus, XCircle, ChevronDown, ChevronUp, AlertTriangle, Repeat, Package, Edit, BookOpen, CornerDownLeft, Loader2, FileInput } from 'lucide-react'; // Added Loader2, FileInput
import { OPERATION_MODES, INITIAL_AI_RESPONSE_MESSAGE, PROCESSING_AI_RESPONSE_MESSAGE, AI_MAX_INPUT_CHARS } from './constants'; 
import { OperationMode, UserPreferences, LoreEntry, AppTheme } from './types'; 

interface AiWriterProps {
  showAiWriterSection: boolean;
  operationMode: string;
  customSystemInstruction: string;
  inputPrompt: string;
  aiResponse: string; 
  isLoading: boolean;
  error: string | null;
  inputCharCount: number; 
  responseCharCount: number; 
  defaultCustomModeSI: string;
  currentTheme: AppTheme; 
  userPreferences: UserPreferences; 
  activeProjectName?: string | null;
  allProjectLoreEntries: LoreEntry[]; 
  onOperationModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCustomSystemInstructionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInputPromptChange: (value: string) => void; 
  onClearInput: () => void;
  onSubmit: (selectedContextLoreIds?: string[]) => Promise<void>; 
  onCopyResponse: (isYaml?: boolean) => Promise<void>; 
  onSaveResponseAsNewNote: () => void;
  onInsertToEditor: (textToInsert: string) => void;
  aiResponseRef: React.RefObject<HTMLDivElement>;
  onAutoCreateLoreEntries: (entries: Array<{ title: string; type: LoreEntry['type']; }>) => void; 
  onImportMarkdownToPrompt: (file: File) => void; // New prop for MD import
}

const MIN_WORD_LENGTH_FOR_REPETITION_CHECK = 2; 
const STREAM_ERROR_MARKER = "[[STREAM_ERROR]]"; // Must match the one in geminiService

const VALID_LORE_TYPES: LoreEntry['type'][] = ['Character', 'Place', 'Item', 'Concept', 'Event', 'Other', 'ArcanaSystem'];
const isValidLoreType = (typeString: string): typeString is LoreEntry['type'] => {
  return VALID_LORE_TYPES.includes(typeString as LoreEntry['type']);
};

const parseLoreNotations = (text: string): Array<{ title: string; type: LoreEntry['type']; }> => {
  const entries: Array<{ title: string; type: LoreEntry['type']; }> = [];
  const bracketRegex = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g; 
  const mentionRegex = /@([\w-]+)/g; 

  let match;

  while ((match = bracketRegex.exec(text)) !== null) {
    const title = match[1].trim();
    let typeString = match[2] ? match[2].trim() : 'Concept'; 
    if (title) {
        const type = isValidLoreType(typeString) ? typeString : 'Concept'; 
        entries.push({ title, type });
    }
  }

  while ((match = mentionRegex.exec(text)) !== null) {
    const title = match[1].trim();
    if (title) {
        entries.push({ title, type: 'Character' }); 
    }
  }
  return entries;
};


const AiWriter: React.FC<AiWriterProps> = ({
  showAiWriterSection,
  operationMode,
  customSystemInstruction,
  inputPrompt,
  aiResponse, 
  isLoading,
  error, // Error state from NoteTaskApp, not directly used for display here as aiResponse contains error HTML
  inputCharCount, 
  responseCharCount, 
  defaultCustomModeSI,
  currentTheme,
  userPreferences,
  activeProjectName,
  allProjectLoreEntries,
  onOperationModeChange,
  onCustomSystemInstructionChange,
  onInputPromptChange, 
  onClearInput,
  onSubmit,
  onCopyResponse, 
  onSaveResponseAsNewNote,
  onInsertToEditor,
  aiResponseRef, 
  onAutoCreateLoreEntries,
  onImportMarkdownToPrompt,
}) => {
  const [wordRepetitions, setWordRepetitions] = useState<Record<string, number>>({});
  const [showRepetitionPopover, setShowRepetitionPopover] = useState(false);
  const [selectedContextLoreIds, setSelectedContextLoreIds] = useState<string[]>([]);
  
  const [proseContentForDisplay, setProseContentForDisplay] = useState<string>('');
  const [yamlContentForDisplay, setYamlContentForDisplay] = useState<string | null>(null);
  const yamlOutputRef = useRef<HTMLPreElement>(null);
  const importAiPromptFileInputRef = useRef<HTMLInputElement>(null);

  const repetitionThreshold = userPreferences.aiWriterPreferences.repetitionThreshold || 3;

  // Effect for live streaming display
  useEffect(() => {
    if (isLoading && aiResponseRef.current) {
      if (aiResponse.startsWith(STREAM_ERROR_MARKER)) {
         aiResponseRef.current.innerHTML = aiResponse.substring(STREAM_ERROR_MARKER.length);
      } else {
         aiResponseRef.current.innerHTML = window.marked?.parse(aiResponse || '') || `<pre>${(aiResponse || '').replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
      }
    }
  }, [aiResponse, isLoading, aiResponseRef]);

  // Effect for final parsing after stream ends
  useEffect(() => {
    if (!isLoading) { // Only parse when loading is finished
      if (aiResponse.startsWith(STREAM_ERROR_MARKER)) {
        setProseContentForDisplay(aiResponse.substring(STREAM_ERROR_MARKER.length));
        setYamlContentForDisplay(null);
        return;
      }

      if (!aiResponse || aiResponse.trim() === '') {
          setProseContentForDisplay(INITIAL_AI_RESPONSE_MESSAGE);
          setYamlContentForDisplay(null);
          return;
      }

      const yamlRegex = /```yaml\n([\s\S]*?)\n```|---\n([\s\S]*?)\n---/;
      const match = aiResponse.match(yamlRegex);

      if (match) {
        const extractedYaml = match[1] || match[2];
        setYamlContentForDisplay(extractedYaml.trim());
        const prose = aiResponse.replace(match[0], '').trim();
        const htmlProse = window.marked?.parse(prose || INITIAL_AI_RESPONSE_MESSAGE) || `<pre>${prose.replace(/</g, "&lt;").replace(/>/g, "&gt;") || INITIAL_AI_RESPONSE_MESSAGE}</pre>`;
        setProseContentForDisplay(htmlProse);
      } else {
        const htmlProse = window.marked?.parse(aiResponse) || `<pre>${aiResponse.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
        setProseContentForDisplay(htmlProse);
        setYamlContentForDisplay(null);
      }
    } else {
      // While loading, keep specific loading message or clear old content
      // The live streaming useEffect handles the aiResponseRef directly.
      // We might want to set a placeholder here if aiResponseRef isn't immediately updated.
      setProseContentForDisplay(''); // Clear or set to processing
      setYamlContentForDisplay(null);
    }
  }, [aiResponse, isLoading]);


  useEffect(() => {
    if (!inputPrompt || inputPrompt.trim() === '') {
      setWordRepetitions({});
      return;
    }
    const analyze = () => {
      const cleanedText = inputPrompt.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"“”…‘’\[\]\n\r\t]/g, ' ') 
        .replace(/\s+/g, ' '); 
      const words = cleanedText.split(' ').filter(word => word.length >= MIN_WORD_LENGTH_FOR_REPETITION_CHECK);
      const counts: Record<string, number> = {};
      words.forEach(word => { counts[word] = (counts[word] || 0) + 1; });
      setWordRepetitions(counts);
    };
    const timeoutId = setTimeout(analyze, 300);
    return () => clearTimeout(timeoutId);
  }, [inputPrompt, MIN_WORD_LENGTH_FOR_REPETITION_CHECK]);

  const wordsOverThreshold = Object.entries(wordRepetitions)
    .filter(([_, count]) => count > repetitionThreshold)
    .sort(([, countA], [, countB]) => countB - countA);

  const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const selectFillColor = isDarkTheme ? '%23CBD5E1' : (currentTheme.name.toLowerCase().includes('paper') ? '%23374151' : '%23475569');
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${selectFillColor}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionClasses = `${currentTheme.cardBg} ${currentTheme.inputText}`;
  const multiSelectStyle = { minHeight: '80px', padding: '0.5rem 0.75rem' };

  const handleSubmitWithLoreParsing = async (currentPrompt: string) => {
    const parsedEntries = parseLoreNotations(currentPrompt);
    if (userPreferences.aiWriterPreferences.autoAddLoreFromAi && parsedEntries.length > 0) { // Check preference
        onAutoCreateLoreEntries(parsedEntries);
    }
    if (currentPrompt !== inputPrompt) { onInputPromptChange(currentPrompt); }
    await onSubmit(selectedContextLoreIds); 
  };
  
  const handleCopyToClipboard = async (isYamlBlock: boolean) => {
    let textToCopy = "";
    if (isYamlBlock && yamlOutputRef.current) { textToCopy = yamlOutputRef.current.textContent || ""; } 
    else if (!isYamlBlock && aiResponseRef.current) {
      const tempDiv = document.createElement('div');
      // Use proseContentForDisplay if available and not loading, otherwise use the direct aiResponse (which might be mid-stream)
      const contentToParse = !isLoading && proseContentForDisplay ? proseContentForDisplay : aiResponseRef.current.innerHTML;
      tempDiv.innerHTML = contentToParse; 
      textToCopy = tempDiv.textContent || tempDiv.innerText || "";
    }
    if (!textToCopy.trim() || textToCopy.includes('ผลลัพธ์จาก AI จะปรากฏที่นี่...') || textToCopy.includes('กำลังประมวลผล...')) { alert(`ไม่มีข้อความ${isYamlBlock ? ' YAML ' : ' '}ให้คัดลอก`); return; }
    try { await navigator.clipboard.writeText(textToCopy); alert(`คัดลอก${isYamlBlock ? ' YAML ' : 'ผลลัพธ์ AI '}สำเร็จ`); } 
    catch (err) { alert(`ไม่สามารถคัดลอก${isYamlBlock ? ' YAML ' : 'ผลลัพธ์ AI '}ได้`); }
  };
  
  const handleSelectedLoreContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedContextLoreIds(values);
  };

  const handleInsertToActiveNote = () => {
    if (aiResponseRef.current && !isLoading && proseContentForDisplay && !proseContentForDisplay.includes(STREAM_ERROR_MARKER)) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = proseContentForDisplay; // Use the fully parsed prose content
        const textToInsert = tempDiv.textContent || tempDiv.innerText || "";
        if (textToInsert.trim()) { onInsertToEditor(textToInsert); alert('แทรกผลลัพธ์ AI ลงในโน้ตที่กำลังแก้ไข (หากมี)'); } 
        else { alert('ไม่มีข้อความผลลัพธ์ AI ให้แทรก'); }
    } else { alert('ไม่มีผลลัพธ์ AI ที่ถูกต้องสำหรับแทรก หรือ AI กำลังประมวลผล'); }
  };

  const handleImportAiPromptFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        onImportMarkdownToPrompt(file);
    }
    if (importAiPromptFileInputRef.current) {
        importAiPromptFileInputRef.current.value = ""; // Reset file input
    }
  };


  if (!showAiWriterSection) return null;

  return (
    <div className={`${currentTheme.cardBg} rounded-xl p-4 sm:p-6 mb-6 shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-semibold ${currentTheme.text} flex items-center`}>
            <MessageSquare className={`w-5 h-5 mr-2 ${currentTheme.accent.replace('bg-','text-')}`}/> AI ผู้ช่วยนักเขียน
        </h3>
        {activeProjectName && (
            <div className={`text-xs ${currentTheme.text} opacity-70 flex items-center bg-white/5 px-2 py-1 rounded-md`}>
                <Package size={12} className="mr-1.5 opacity-80" />
                Context: โปรเจกต์ "{activeProjectName}"
            </div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="operation-mode-ai" className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>โหมด AI:</label>
        <div className="relative">
          <select
            id="operation-mode-ai" value={operationMode} onChange={onOperationModeChange} disabled={isLoading}
            className={`w-full py-2.5 px-3.5 pr-10 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} appearance-none focus:outline-none focus:ring-2 ${currentTheme.focusRing} transition-colors text-sm bg-no-repeat bg-right-2.5`}
            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
            aria-label="เลือกโหมด AI"
          >
            {OPERATION_MODES.map((mode: OperationMode) => (<option key={mode.value} value={mode.value} className={optionClasses}>{mode.label}</option>))}
          </select>
        </div>
      </div>

      {operationMode === 'custom' && (
        <div className="mb-4">
          <label htmlFor="custom-system-instruction-ai" className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>System Instruction (AI กำหนดเอง):</label>
          <textarea
            id="custom-system-instruction-ai" value={customSystemInstruction} onChange={onCustomSystemInstructionChange} disabled={isLoading} placeholder={defaultCustomModeSI}
            className={`w-full p-3 rounded-lg min-h-[80px] resize-y ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing} transition-colors text-sm`}
            aria-describedby="custom-si-ai-helper"
          />
           <p id="custom-si-ai-helper" className={`text-xs ${currentTheme.text} opacity-70 mt-1`}>ป้อน System Instruction สำหรับ AI ที่นี่ (ถ้าเว้นว่างจะใช้ค่าเริ่มต้น)</p>
        </div>
      )}

      <div className="mb-1">
        <div className="flex justify-between items-center mb-1">
            <label htmlFor="input-prompt-ai" className={`block text-sm font-medium ${currentTheme.text} opacity-90`}>คำสั่งสำหรับ AI:</label>
            <input 
                type="file" 
                accept=".md" 
                ref={importAiPromptFileInputRef} 
                onChange={handleImportAiPromptFileSelect} 
                style={{ display: 'none' }} 
                aria-label="Import Markdown for AI prompt"
            />
            <button
                onClick={() => importAiPromptFileInputRef.current?.click()}
                disabled={isLoading}
                className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} text-xs px-2.5 py-1 rounded-md hover:opacity-80 transition-opacity flex items-center gap-1`}
                title="นำเข้าไฟล์ Markdown (.md) มายังช่องคำสั่งนี้"
            >
                <FileInput size={12} /> นำเข้า MD
            </button>
        </div>
        <textarea
          id="input-prompt-ai" value={inputPrompt} onChange={(e) => onInputPromptChange(e.target.value)} disabled={isLoading}
          placeholder={`ใส่เนื้อหา, คำถาม, หรือคำสั่งสำหรับ AI... สามารถใช้ [[ชื่อข้อมูล]] [[ชื่อข้อมูล|ประเภท]] หรือ @ชื่อตัวละคร เพื่อสร้างข้อมูลโลกอัตโนมัติ`}
          className={`w-full p-3 rounded-lg min-h-[120px] resize-y ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing} transition-colors text-sm`}
          aria-describedby="input-char-count-ai input-repetition-info-ai"
        />
        <div className="flex justify-between items-center mt-1">
            {wordsOverThreshold.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setShowRepetitionPopover(!showRepetitionPopover)}
                        onMouseEnter={() => setShowRepetitionPopover(true)} onMouseLeave={() => setShowRepetitionPopover(false)}
                        className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${wordsOverThreshold.length > 2 ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}
                        aria-describedby="repetition-popover" id="input-repetition-info-ai"
                    >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />พบคำซ้ำ ({wordsOverThreshold.length} คำ)
                    </button>
                    {showRepetitionPopover && (
                        <div id="repetition-popover" role="tooltip" className={`absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg shadow-xl ${currentTheme.cardBg} border ${isDarkTheme ? 'border-slate-600' : 'border-gray-300'} z-10`}>
                            <p className={`text-sm font-semibold ${currentTheme.text} mb-1`}>คำที่ใช้ซ้ำเกิน {repetitionThreshold} ครั้ง:</p>
                            <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto">
                                {wordsOverThreshold.map(([word, count]) => (<li key={word} className={`${currentTheme.text} opacity-90`}>"{word}": {count} ครั้ง</li>))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            <div className="flex-grow"></div> {}
            <div id="input-char-count-ai" className={`text-xs text-right pr-1 ${inputCharCount > AI_MAX_INPUT_CHARS ? 'text-red-400 font-semibold' : `${currentTheme.text} opacity-70`}`} aria-live="polite">
                จำนวนตัวอักษร: {inputCharCount} 
            </div>
        </div>
      </div>
       
      {allProjectLoreEntries.length > 0 && (
         <div className="mb-4">
            <label htmlFor="context-lore-selector" className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1 flex items-center`}>
                <BookOpen size={14} className="mr-1.5 opacity-70"/> ข้อมูลอ้างอิงเพิ่มเติม (Lore):
            </label>
            <select
                id="context-lore-selector"
                multiple
                value={selectedContextLoreIds}
                onChange={handleSelectedLoreContextChange}
                disabled={isLoading}
                className={`w-full rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing} text-sm`}
                style={multiSelectStyle}
                aria-label="เลือกข้อมูลโลกสำหรับ AI context"
            >
                {allProjectLoreEntries.map(lore => (
                    <option key={lore.id} value={lore.id} className={optionClasses}>
                        {lore.title} ({lore.type})
                    </option>
                ))}
            </select>
            <p className={`text-xs ${currentTheme.text} opacity-60 mt-1`}>เลือกข้อมูลโลกจากโปรเจกต์ปัจจุบันเพื่อใช้เป็นบริบทเพิ่มเติม (กด Ctrl/Cmd ค้างไว้เพื่อเลือกหลายรายการ)</p>
         </div>
       )}
      
      <div className="flex flex-col sm:flex-row justify-end items-center my-4 gap-3">
        <button onClick={onClearInput} disabled={isLoading} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors duration-200 hover:shadow-md`}>
          <XCircle className="w-4 h-4" /> ล้าง
        </button>
        <button onClick={() => handleSubmitWithLoreParsing(inputPrompt)} disabled={isLoading || !inputPrompt.trim() || inputCharCount > AI_MAX_INPUT_CHARS} className={`${currentTheme.button} ${currentTheme.buttonText} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2 px-5 rounded-lg transition-colors duration-200 shadow-sm hover:scale-105 disabled:opacity-60 disabled:hover:scale-100`}>
          {isLoading ? (<Loader2 className={`w-5 h-5 ${currentTheme.buttonText === 'text-white' ? 'border-white' : currentTheme.accentText.replace('text-','border-')} animate-spin`} aria-hidden="true" />) : (<Send className="w-4 h-4" />)}
          {isLoading ? 'กำลังส่ง...' : 'ส่งให้ AI'}
        </button>
      </div>
      
      {yamlContentForDisplay && !isLoading && (
        <div className="mb-4">
          <label className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>YAML Metadata จาก AI:</label>
          <div className="yaml-output">
            <pre ref={yamlOutputRef} className={`${isDarkTheme ? 'dark' : 'light'} rounded-md`} tabIndex={0}>{yamlContentForDisplay}</pre>
          </div>
           <button 
            onClick={() => handleCopyToClipboard(true)} 
            disabled={isLoading || !yamlContentForDisplay} 
            className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} text-xs mt-1.5 px-2 py-1 rounded-md transition-colors duration-200 disabled:opacity-60 flex items-center gap-1 hover:shadow-sm`}
          >
            <Copy size={12}/> คัดลอก YAML
          </button>
        </div>
      )}

      <div className="mb-2">
          <label className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>ผลลัพธ์จาก AI (ข้อความ):</label>
          <div
              ref={aiResponseRef} tabIndex={0} aria-live="assertive"
              className={`ai-response-output p-3.5 min-h-[150px] max-h-[400px] overflow-y-auto rounded-lg ${currentTheme.aiResponseBg} border ${currentTheme.divider} prose-sm ${isDarkTheme ? 'prose-dark' : ''} max-w-none ${currentTheme.text} opacity-90`}
              dangerouslySetInnerHTML={{ __html: isLoading ? (aiResponse ? window.marked?.parse(aiResponse) : PROCESSING_AI_RESPONSE_MESSAGE) : proseContentForDisplay }}
              style={{fontFamily: 'Sarabun, sans-serif'}}
          />
          <div className={`text-xs ${currentTheme.text} opacity-70 mt-1 text-right pr-1`}>จำนวนตัวอักษร: {responseCharCount}</div>
      </div>

       <div className="flex flex-col sm:flex-row justify-end mt-4 gap-3">
          <button onClick={() => handleCopyToClipboard(false)} disabled={isLoading || (!proseContentForDisplay && !aiResponse.includes(STREAM_ERROR_MARKER) && aiResponse.trim() === '')} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 hover:shadow-md`}>
              <Copy className="w-4 h-4" /> คัดลอกผลลัพธ์ (ข้อความ)
          </button>
          <button 
            onClick={handleInsertToActiveNote} 
            disabled={isLoading || (!proseContentForDisplay && !aiResponse.includes(STREAM_ERROR_MARKER) && aiResponse.trim() === '')}
            className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 hover:shadow-md`}
            title="แทรกผลลัพธ์ AI (ส่วนข้อความ) ลงในโน้ตที่กำลังแก้ไข"
          >
              <CornerDownLeft className="w-4 h-4" /> แทรกลงโน้ต
          </button>
          <button onClick={onSaveResponseAsNewNote} disabled={isLoading || (!proseContentForDisplay && !aiResponse.includes(STREAM_ERROR_MARKER) && aiResponse.trim() === '')} className={`${currentTheme.button} ${currentTheme.buttonText} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 hover:shadow-md`}>
              <Plus className="w-4 h-4" /> บันทึกเป็นโน้ต
          </button>
      </div>
    </div>
  );
};

export default AiWriter;
