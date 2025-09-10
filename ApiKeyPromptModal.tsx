
import React, { useState, useEffect } from 'react';
import { AppTheme } from './types';
import { KeyRound, Save, XCircle } from 'lucide-react';

interface ApiKeyPromptModalProps {
  show: boolean;
  currentTheme: AppTheme;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyPromptModal: React.FC<ApiKeyPromptModalProps> = ({
  show,
  currentTheme,
  onClose,
  onSave,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    if (show) {
      setApiKeyInput(''); // Reset input when modal is shown
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const handleSaveClick = () => {
    if (apiKeyInput.trim()) {
      onSave(apiKeyInput.trim());
    } else {
      // Optionally, provide feedback to the user that the key can't be empty
      // For now, just closes or relies on onSave to handle empty strings if needed
      onClose();
    }
  };
  
  const inputFieldClasses = `w-full px-4 py-3 rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[80] p-4" role="dialog" aria-modal="true" aria-labelledby="apiKeyModalTitle">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl`}>
        <div className="flex justify-between items-center mb-5">
            <h3 id="apiKeyModalTitle" className={`text-xl font-semibold ${currentTheme.text} flex items-center`}>
                <KeyRound className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')}`} />
                ป้อน API Key
            </h3>
            <button onClick={onClose} className={`${currentTheme.textSecondary} hover:opacity-70 transition-opacity`} aria-label="Close API Key prompt">
                <XCircle size={24} />
            </button>
        </div>
        
        <p className={`${currentTheme.textSecondary} text-sm mb-4`}>
          กรุณาป้อน Gemini API Key ของคุณเพื่อใช้งานฟีเจอร์ AI Key นี้จะถูกเก็บไว้ใน Local Storage ของเบราว์เซอร์คุณเท่านั้น
        </p>

        <input
          type="password" // Use password type to obscure the key
          placeholder="API Key ของคุณ"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          className={`${inputFieldClasses} mb-6`}
          aria-label="Gemini API Key Input"
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} transition-colors duration-200`}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSaveClick}
            className={`flex-1 py-2.5 rounded-xl ${currentTheme.button} ${currentTheme.buttonText} transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2`}
          >
            <Save size={16} /> บันทึก Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPromptModal;
