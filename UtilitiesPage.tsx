
import React, { useState } from 'react';
import { AppTheme } from './types';
import { Search, Plug, Book, ListChecks, Cpu, AlertTriangle, Loader2 } from 'lucide-react';

interface UtilitiesPageProps {
  currentTheme: AppTheme;
}

type ActiveTab = 'notes' | 'tasks' | 'ai';

const UtilitiesPage: React.FC<UtilitiesPageProps> = ({ currentTheme }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
  const [searchInput, setSearchInput] = useState('');
  const [apiInput, setApiInput] = useState('');
  const [apiResult, setApiResult] = useState('ผลลัพธ์ API จะแสดงที่นี่...');
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const mockupNotes = [
    { id: 1, title: 'บทที่ 3: เผชิญหน้า', time: '2 ชม.ที่แล้ว', iconColor: 'text-[#5D5CDE]' },
    { id: 2, title: 'ไอเดียโลกแฟนตาซี', time: '5 ชม.ที่แล้ว', iconColor: 'text-[#7E7DE6]' },
    { id: 3, title: 'บทสนทนาตัวละครหลัก', time: '1 วันที่แล้ว', iconColor: 'text-[#5D5CDE]' },
  ];

  const mockupTasks = [
    { id: 1, title: 'ออกแบบ UI หน้าแดชบอร์ด', date: '7 มิ.ย. 2025', iconColor: 'text-green-500' },
    { id: 2, title: 'เขียนเนื้อหาบทที่ 4', date: '10 มิ.ย. 2025', iconColor: 'text-green-500' },
  ];

  const filteredMockupNotes = mockupNotes.filter(note => 
    note.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleApiTest = async () => {
    if (!apiInput.trim()) {
      setApiResult('กรุณาป้อน API URL หรือ API Key');
      return;
    }
    setIsLoadingApi(true);
    setApiResult('กำลังเชื่อมต่อ...');
    try {
      // Basic check if it's likely an API key (no slashes, typical length) vs a URL
      // This is a very naive check and not robust for actual API key validation.
      const isLikelyApiKey = !apiInput.includes('/') && apiInput.length > 20 && apiInput.length < 100;

      if (isLikelyApiKey) {
         // Simulate API Key test - in a real app, this would POST to your backend
         // which then uses the key to call an external service.
         // For this example, we'll just display it as if it's a successful "test".
        setApiResult(`ทดสอบ API Key: "${apiInput}"\n(ในตัวอย่างนี้ เป็นการแสดงผลจำลองการทดสอบ Key)`);
        // Simulate Mascot Tip update
        // In a real app this might be a separate state or alert/toast
        setApiResult(prev => prev + "\n\n🤖 Mascot: ทดสอบ API Key สำเร็จ!");

      } else {
        // Assumed to be a URL
        const response = await fetch(apiInput);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        let resultText = text;
        try {
          // Try to parse and pretty-print if it's JSON
          const json = JSON.parse(text);
          resultText = JSON.stringify(json, null, 2);
        } catch (e) {
          // Not JSON, or malformed JSON, just use the raw text
        }
        setApiResult(resultText);
        // Simulate Mascot Tip update
        setApiResult(prev => prev + "\n\n🤖 Mascot: เชื่อมต่อ API และดึงข้อมูลสำเร็จ!");
      }
    } catch (e: any) {
      setApiResult(`❌ ไม่สามารถเชื่อมต่อหรือดึงข้อมูลจาก API ได้:\n${e.message}`);
      // Simulate Mascot Tip update
      setApiResult(prev => prev + "\n\n🤖 Mascot: ขออภัย เชื่อมต่อ API ไม่สำเร็จ");
    } finally {
      setIsLoadingApi(false);
    }
  };
  
  const getTabButtonClass = (tabName: ActiveTab) => {
    const baseClass = "font-semibold px-4 py-2 rounded-lg transition-colors duration-150";
    if (activeTab === tabName) {
      if (tabName === 'notes') return `${baseClass} text-primary-dark bg-primary/20 ring-2 ring-primary-dark`;
      if (tabName === 'tasks') return `${baseClass} text-green-700 dark:text-green-300 bg-green-500/20 ring-2 ring-green-600`;
      if (tabName === 'ai') return `${baseClass} text-orange-700 dark:text-orange-300 bg-orange-500/20 ring-2 ring-orange-600`;
    }
    if (tabName === 'notes') return `${baseClass} text-primary-dark dark:text-primary-light bg-primary/5 hover:bg-primary/10`;
    if (tabName === 'tasks') return `${baseClass} text-green-700 dark:text-green-400 bg-green-500/5 hover:bg-green-500/10`;
    if (tabName === 'ai') return `${baseClass} text-orange-700 dark:text-orange-400 bg-orange-500/5 hover:bg-orange-500/10`;
    return baseClass;
  };


  return (
    <div className={`py-6 ${currentTheme.text}`}>
      <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} mb-6 text-center`}>
        เครื่องมือเสริมและ API Connector
      </h2>

      <section className="px-2 sm:px-4 py-6 max-w-3xl w-full mx-auto relative">
        {/* 1. Search & Tab Switch */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <div className="relative">
            <input 
              id="searchInput" 
              type="search" 
              placeholder="ค้นหาในโน้ตตัวอย่าง..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`rounded-lg px-3 py-2.5 pl-10 border ${currentTheme.inputBorder} ${currentTheme.inputBg} ${currentTheme.inputText} focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition w-full sm:w-64`}
            />
            <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-60`} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className={getTabButtonClass('notes')} onClick={() => setActiveTab('notes')}>โน้ต</button>
            <button className={getTabButtonClass('tasks')} onClick={() => setActiveTab('tasks')}>งาน</button>
            <button className={getTabButtonClass('ai')} onClick={() => setActiveTab('ai')}>AI</button>
          </div>
        </div>

        {/* 2. API Connector */}
        <div className="glass-card rounded-xl p-4 sm:p-6 mb-6 shadow-lg">
          <h3 className={`font-semibold text-lg mb-3 flex items-center ${currentTheme.text}`}>
            <Plug size={20} className="mr-2 text-[var(--primary)]" /> ช่องเชื่อม API (API Connector)
          </h3>
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            <input 
              id="apiInput" 
              type="text" 
              value={apiInput}
              onChange={(e) => setApiInput(e.target.value)}
              className={`flex-1 rounded-lg border px-3 py-2.5 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${currentTheme.inputText} focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition`} 
              placeholder="ใส่ API URL หรือ API KEY (จำลอง)"
            />
            <button 
              id="apiTestBtn" 
              onClick={handleApiTest}
              disabled={isLoadingApi}
              className="rounded-lg bg-[var(--primary)] text-white font-semibold px-4 py-2.5 hover:bg-[var(--primary-dark)] transition duration-150 flex items-center justify-center disabled:opacity-70"
            >
              {isLoadingApi ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Plug size={16} className="mr-2"/>
              )}
              {isLoadingApi ? 'กำลังทดสอบ...' : 'ทดสอบเชื่อมต่อ'}
            </button>
          </div>
          <div 
            id="apiResult" 
            className={`text-xs ${currentTheme.textSecondary} ${currentTheme.inputBg} bg-opacity-50 rounded p-3 mt-2 overflow-auto whitespace-pre-wrap break-all shadow-inner`} 
            style={{ maxHeight: '180px' }}
            aria-live="polite"
          >
            {isLoadingApi && apiResult === 'กำลังเชื่อมต่อ...' ? (
                <div className="flex items-center justify-center text-sm">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {apiResult}
                </div>
            ) : apiResult.includes('❌') ? (
                <div className="flex items-start text-red-500 dark:text-red-400">
                    <AlertTriangle size={18} className="mr-2 flex-shrink-0"/>
                    <span>{apiResult.replace(/🤖 Mascot:.*?$/, '').trim()}</span>
                </div>
            ) : (
              apiResult
            )}
          </div>
        </div>

        {/* 3. Section Switch (Show/Hide by tab) */}
        {activeTab === 'notes' && (
          <div id="tab-notes" className="tab-section animate-fadeIn">
            <div className="glass-card rounded-xl p-4 sm:p-6 mb-4 shadow-lg">
              <h3 className={`font-semibold text-lg mb-3 ${currentTheme.text}`}>โน้ตล่าสุด (ตัวอย่าง)</h3>
              {filteredMockupNotes.length > 0 ? (
                <ul id="noteList" className="space-y-2.5">
                  {filteredMockupNotes.map(note => (
                    <li key={note.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--primary-light)] hover:bg-opacity-10 dark:hover:bg-[var(--primary-dark)] dark:hover:bg-opacity-20 transition cursor-pointer ${currentTheme.inputBg} bg-opacity-30`}>
                      <div className="flex items-center space-x-2.5">
                        <Book size={18} className={note.iconColor} />
                        <span className={currentTheme.text}>{note.title}</span>
                      </div>
                      <small className={`${currentTheme.textSecondary} opacity-80`}>{note.time}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`${currentTheme.textSecondary} italic`}>ไม่พบโน้ตตัวอย่างที่ตรงกับคำค้นหา "{searchInput}"</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div id="tab-tasks" className="tab-section animate-fadeIn">
            <div className="glass-card rounded-xl p-4 sm:p-6 mb-4 shadow-lg">
              <h3 className={`font-semibold text-lg mb-3 ${currentTheme.text}`}>งาน (ตัวอย่าง)</h3>
              <ul className="space-y-2.5">
                {mockupTasks.map(task => (
                  <li key={task.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-green-500/10 dark:hover:bg-green-500/20 transition cursor-pointer ${currentTheme.inputBg} bg-opacity-30`}>
                    <div className="flex items-center space-x-2.5">
                      <ListChecks size={18} className={task.iconColor} />
                      <span className={currentTheme.text}>{task.title}</span>
                    </div>
                    <small className={`${currentTheme.textSecondary} opacity-80`}>{task.date}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div id="tab-ai" className="tab-section animate-fadeIn">
            <div className="glass-card rounded-xl p-4 sm:p-6 mb-4 shadow-lg">
              <h3 className={`font-semibold text-lg mb-3 ${currentTheme.text}`}>AI Writer (ตัวอย่าง)</h3>
              <div className={`${currentTheme.textSecondary} text-sm mb-4`}>ขอไอเดีย, ช่วยแต่ง, สร้าง prompt ฯลฯ (ส่วนนี้เป็นเพียงตัวอย่าง UI)</div>
              <button 
                onClick={() => alert('ไปยังส่วน AI Writer หลัก (จำลอง)')}
                className="rounded-lg bg-orange-500 text-white font-semibold px-4 py-2.5 hover:bg-orange-600 transition duration-150 flex items-center"
              >
                <Cpu size={18} className="mr-2"/> ทดลองใช้ AI (จำลอง)
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UtilitiesPage;
