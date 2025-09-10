
import React, { useState, useEffect, useRef } from 'react';
import { Smile, X } from 'lucide-react'; // Using X for "No Icon"
import { AppTheme } from './types'; // Added AppTheme

interface EmojiPickerProps {
  selectedEmoji: string | undefined;
  onEmojiSelect: (emoji: string) => void;
  currentTheme: AppTheme; // Changed to AppTheme
}

const defaultEmojis: string[] = [
  '✨', '📝', '📄', '📓', '📚', '🖋️', '🧠', '💡', '💬', '✅', '☑️', '📋', 
  '🎯', '🚀', '📈', '📊', '📌', '📍', '🗓️', '⏰', '⚙️', '🔧', '🎨', '🎭', 
  '🎬', '🌍', '🔬', '🌱', '💰', '❤️', '⭐', '🎉', '🎁', '🏠', '💼', 
  '✈️', '🛒', '🤔', '👍', '👎', '❓', '❗', '⚠️', '🤖', '👻', '👽', '🪵', 
  '🔥', '💧', '💨', 
  // Adding some common category emojis from getCategoryIcon
  '💖', // Heart (alternative for personal/character)
  '🗺️', // Map (place)
  '💎', // Gem (item)
  '💭', // Thought bubble (concept)
  // '🗓️', // Calendar (event - already present) // Duplicate, removed
  '💻', // Laptop (tech/cpu idea)
  // '💡', // Lightbulb (ideas - already present) // Duplicate, removed
  '🤷'  // Shrug (other)
];
// Remove duplicates from defaultEmojis
const uniqueDefaultEmojis = Array.from(new Set(defaultEmojis));


const EmojiPicker: React.FC<EmojiPickerProps> = ({ selectedEmoji, onEmojiSelect, currentTheme }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsPanelOpen(false);
  };

  const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`w-12 h-12 flex items-center justify-center rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing} text-2xl`}
        aria-label="เลือกไอคอนอีโมจิ"
        aria-expanded={isPanelOpen}
      >
        {selectedEmoji || <Smile className={`w-6 h-6 ${currentTheme.textSecondary} opacity-70`} />}
      </button>

      {isPanelOpen && (
        <div className={`absolute z-10 mt-2 w-72 ${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-xl shadow-lg p-3`}>
          <div className="grid grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`h-10 w-10 flex items-center justify-center rounded-lg hover:${currentTheme.sidebarHoverBg} ${currentTheme.textSecondary} transition-colors`}
              title="ไม่มีไอคอน"
              aria-label="เลือกไม่มีไอคอน"
            >
              <X className="w-5 h-5" />
            </button>
            {uniqueDefaultEmojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                className={`h-10 w-10 flex items-center justify-center rounded-lg hover:${currentTheme.sidebarHoverBg} text-2xl transition-colors ${selectedEmoji === emoji ? `${currentTheme.focusRing} ${currentTheme.sidebarActiveBg}` : ''}`}
                aria-label={`เลือกอีโมจิ ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;