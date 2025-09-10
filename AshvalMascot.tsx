
import React, { useState, useEffect, useRef } from 'react';
import { AppTheme } from './types';
import { Bot, X, MessageSquare } from 'lucide-react';

interface AshvalMascotProps {
  currentTheme: AppTheme;
}

const mascotTips = [
  "✨ เคล็ดลับ: ลองใช้ AI สร้างไอเดียใหม่ๆ ได้เลย",
  "💡 กดที่ฉันเพื่อขอคำแนะนำได้ทุกเมื่อ!",
  "📝 จัดระเบียบโน้ตและงานของคุณให้ง่ายขึ้น",
  "🚀 เขียนทุกวัน ก้าวไปอีกขั้นกับ Ashval!",
  "🎯 อย่าลืมตั้งเป้าหมายประจำวันของคุณ",
  "สงสัยอะไรไหม? ถามฉันได้นะ!",
  "กำลังมองหาแรงบันดาลใจ? ลองใช้ AI ช่วยสิ",
];

const AshvalMascot: React.FC<AshvalMascotProps> = ({ currentTheme }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentBubbleTip, setCurrentBubbleTip] = useState(mascotTips[0]);
  const mascotRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mascotInput, setMascotInput] = useState('');


  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentBubbleTip(mascotTips[Math.floor(Math.random() * mascotTips.length)]);
    }, 9000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        mascotRef.current && // Check if mascotRef.current is not null
        !mascotRef.current.contains(event.target as Node) // Check if click is outside mascot itself too
      ) {
        setIsPanelOpen(false);
      }
    };

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

  const togglePanel = () => setIsPanelOpen(!isPanelOpen);

  const handleSendMessage = () => {
    if (mascotInput.trim() === '') {
        alert("กรุณาป้อนคำถามหรือคำแนะนำสำหรับ Ashval Companion ก่อนครับ");
        return;
    }
    // Placeholder for actual AI interaction
    alert(`Ashval Companion (AI): ขอบคุณสำหรับข้อความ "${mascotInput.trim()}"!\n\nฟังก์ชันตอบกลับอัจฉริยะยังอยู่ในระหว่างการพัฒนา โปรดรอการอัปเดตในเวอร์ชันถัดไปครับ`);
    setMascotInput(''); // Clear input after "sending"
  };
  
  const isDark = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const bubbleBg = isDark ? 'bg-slate-800/95' : 'bg-white/95';
  const bubbleText = isDark ? 'text-slate-200' : 'text-slate-700';
  const panelBorderColor = currentTheme.accent.replace('bg-', 'border-');


  return (
    <>
      <div
        ref={mascotRef}
        id="ashval-mascot"
        className={`fixed z-[105] right-6 bottom-24 md:bottom-24 flex flex-col items-center group animate-mascot-float select-none`}
        style={{ cursor: 'pointer' }}
        onClick={togglePanel}
        aria-haspopup="true"
        aria-expanded={isPanelOpen}
        aria-controls="mascot-panel-react"
        title="Ashval Companion"
      >
        <div 
            className={`rounded-full shadow-lg border-4 ${panelBorderColor} w-16 h-16 flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-slate-700/80' : 'bg-white/80' }`}
        >
          <Bot size={36} className={`${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} />
        </div>
        <div
          id="mascot-bubble-react"
          className={`opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 mt-2 ${bubbleBg} ${currentTheme.cardShadow || 'shadow-xl'} rounded-xl px-4 py-2 text-sm max-w-xs ${bubbleText} absolute bottom-20 right-0`}
          style={{ minWidth: '190px' }}
          role="tooltip"
        >
          <div className={`bubble-arrow ${isDark ? 'dark' : ''}`}></div>
          <span dangerouslySetInnerHTML={{ __html: currentBubbleTip.replace(/\n/g, '<br/>') }} />
        </div>
      </div>

      {isPanelOpen && (
        <div
          ref={panelRef}
          id="mascot-panel-react"
          className={`mascot-panel-base ${currentTheme.cardBg} border ${panelBorderColor} ${currentTheme.cardShadow || 'shadow-2xl'} rounded-2xl p-4 transition-opacity duration-300 ease-in-out ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          role="dialog"
          aria-labelledby="mascotPanelTitle"
        >
          <div className="flex items-center mb-3">
            <div className={`w-10 h-10 rounded-full ${currentTheme.accent} flex items-center justify-center text-white text-2xl mr-2.5`}>
              <Bot size={24} />
            </div>
            <span id="mascotPanelTitle" className={`font-bold ${currentTheme.accent.replace('bg-', 'text-')}`}>Ashval Companion</span>
            <button
              id="close-mascot-panel-react"
              onClick={togglePanel}
              className={`ml-auto ${currentTheme.textSecondary} hover:${currentTheme.accent.replace('bg-', 'text-')} transition-colors`}
              aria-label="ปิดหน้าต่าง Ashval Companion"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className={`mb-3 text-sm ${currentTheme.textSecondary}`}>อยากให้ช่วยอะไร? ตัวอย่าง:</div>
          <ul className={`mb-3 text-sm space-y-1 ${currentTheme.textSecondary} opacity-90`}>
            <li>• แนะนำโครงเรื่อง</li>
            <li>• สร้าง Prompt AI</li>
            <li>• วิเคราะห์สถิติการเขียน</li>
            <li>• ให้แรงบันดาลใจ</li>
          </ul>
          <input
            type="text"
            value={mascotInput}
            onChange={(e) => setMascotInput(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 mb-3 ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:ring-2 ${currentTheme.focusRing} transition text-sm`}
            placeholder="ถามหรือขอคำแนะนำ..."
            aria-label="ป้อนคำถามสำหรับ Ashval Companion"
          />
          <button
            onClick={handleSendMessage}
            className={`w-full rounded-lg ${currentTheme.button} ${currentTheme.buttonText} font-semibold py-2 hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2`}
          >
            <MessageSquare size={16} /> ส่งข้อความ
          </button>
        </div>
      )}
    </>
  );
};

export default AshvalMascot;
