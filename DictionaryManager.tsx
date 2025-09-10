import React, { useState, useEffect, useCallback } from 'react';
import { AppTheme } from './types'; 
import { BookText, Search, Trash2, Plus, XCircle } from 'lucide-react';

interface DictionaryManagerProps {
  learnedWords: Set<string>;
  setLearnedWords: React.Dispatch<React.SetStateAction<Set<string>>>;
  currentTheme: AppTheme;
}

const DictionaryManager: React.FC<DictionaryManagerProps> = ({ learnedWords, setLearnedWords, currentTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newWordInput, setNewWordInput] = useState('');
  const [sortedWords, setSortedWords] = useState<string[]>([]);

  useEffect(() => {
    const wordsArray = Array.from(learnedWords).sort((a, b) => a.localeCompare(b));
    setSortedWords(wordsArray);
  }, [learnedWords]);

  const filteredWords = sortedWords.filter(word =>
    word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteWord = useCallback((wordToDelete: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคำว่า "${wordToDelete}" ออกจากพจนานุกรม?`)) {
      setLearnedWords(prevWords => {
        const newWords = new Set(prevWords);
        newWords.delete(wordToDelete);
        return newWords;
      });
    }
  }, [setLearnedWords]);

  const handleAddWord = useCallback(() => {
    const wordToAdd = newWordInput.trim().toLowerCase();
    if (wordToAdd && wordToAdd.length >= 2) { // Simple validation
      if (learnedWords.has(wordToAdd)) {
        alert(`คำว่า "${wordToAdd}" มีอยู่ในพจนานุกรมแล้ว`);
      } else {
        setLearnedWords(prevWords => {
          const newWords = new Set(prevWords);
          newWords.add(wordToAdd);
          return newWords;
        });
        setNewWordInput(''); // Clear input after adding
      }
    } else {
      alert('กรุณาป้อนคำศัพท์ที่ถูกต้อง (อย่างน้อย 2 ตัวอักษร)');
    }
  }, [newWordInput, learnedWords, setLearnedWords]);

  return (
    <div className="py-6">
      <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} mb-6 text-center flex items-center justify-center`}>
        <BookText className={`w-7 h-7 mr-2 ${currentTheme.accent.replace('bg-', 'text-')}`} />
        พจนานุกรมคำศัพท์ที่เรียนรู้แล้ว ({learnedWords.size})
      </h2>

      <div className={`${currentTheme.cardBg} p-4 sm:p-6 rounded-xl shadow-lg mb-6`}>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="ค้นหาคำศัพท์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-2.5 pl-10 pr-4 rounded-lg ${currentTheme.input} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-', 'focus:ring-')}`}
              aria-label="ค้นหาคำศัพท์ในพจนานุกรม"
            />
            <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.text} opacity-50`} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="เพิ่มคำใหม่..."
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
              className={`flex-grow py-2.5 px-3 rounded-lg ${currentTheme.input} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-', 'focus:ring-')}`}
              aria-label="ป้อนคำศัพท์ใหม่เพื่อเพิ่มเข้าพจนานุกรม"
            />
            <button
              onClick={handleAddWord}
              className={`${currentTheme.button} text-white px-4 py-2.5 rounded-lg transition-colors duration-300 hover:scale-105 shadow-md flex items-center text-sm`}
              title="เพิ่มคำศัพท์ใหม่"
            >
              <Plus className="w-4 h-4 mr-1.5" /> เพิ่ม
            </button>
          </div>
        </div>
        
        {learnedWords.size === 0 && (
          <p className={`${currentTheme.text} opacity-70 italic text-center py-8`}>
            พจนานุกรมยังว่างเปล่า AI จะเรียนรู้คำศัพท์ใหม่เมื่อคุณใช้งาน หรือคุณสามารถเพิ่มคำศัพท์เองได้
          </p>
        )}

        {filteredWords.length === 0 && learnedWords.size > 0 && searchTerm && (
          <p className={`${currentTheme.text} opacity-70 italic text-center py-8`}>
            ไม่พบคำศัพท์ที่ตรงกับ "{searchTerm}"
          </p>
        )}

        {filteredWords.length > 0 && (
          <div className={`max-h-[60vh] overflow-y-auto space-y-2 pr-2 rounded-md ${currentTheme.input} bg-opacity-30 p-3`}>
            {filteredWords.map(word => (
              <div
                key={word}
                className={`${currentTheme.cardBg} bg-opacity-70 p-3 rounded-md flex justify-between items-center group hover:shadow-sm transition-shadow`}
              >
                <span className={`${currentTheme.text} text-sm`}>{word}</span>
                <button
                  onClick={() => handleDeleteWord(word)}
                  className="text-red-400 hover:text-red-300 opacity-50 group-hover:opacity-100 transition-opacity p-1"
                  title={`ลบคำว่า "${word}"`}
                  aria-label={`ลบคำว่า "${word}"`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
       <p className={`${currentTheme.text} text-xs text-center opacity-60 mt-4`}>
        คำศัพท์จะถูกบันทึกไว้ในเครื่องของคุณ AI จะเรียนรู้และเพิ่มคำใหม่ๆ เข้ามาเมื่อคุณใช้งาน
      </p>
    </div>
  );
};

export default DictionaryManager;