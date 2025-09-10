
import React from 'react';
import { Clock, Play, Pause, RotateCcw, SkipForward, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { PomodoroConfig, AppTheme } from './types'; // Changed to AppTheme

interface PomodoroTimerProps {
  config: PomodoroConfig;
  tempConfig: PomodoroConfig;
  currentMode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  isActive: boolean;
  currentRound: number;
  currentTheme: AppTheme; // Changed to AppTheme
  onStartPause: () => void;
  onResetCurrent: () => void;
  onSkip: () => void;
  onConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveConfig: () => void;
  formatTime: (seconds: number) => string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  config,
  tempConfig,
  currentMode,
  timeLeft,
  isActive,
  currentRound,
  currentTheme,
  onStartPause,
  onResetCurrent,
  onSkip,
  onConfigChange,
  onSaveConfig,
  formatTime,
}) => {
  return (
    <div className={`${currentTheme.cardBg} rounded-xl p-4 sm:p-6 mb-6 shadow-lg`}>
        <h3 className={`text-xl font-semibold ${currentTheme.text} mb-4 flex items-center`}>
            <Clock className={`w-5 h-5 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')}`}/> Pomodoro Timer
        </h3>
        <div className="text-center mb-4">
            <p className={`text-5xl font-bold ${currentTheme.text}`}>{formatTime(timeLeft)}</p>
            <p className={`${currentTheme.text} opacity-80 text-sm`}>
                โหมด: {currentMode === 'work' ? 'ทำงาน' : currentMode === 'shortBreak' ? 'พักสั้น' : 'พักยาว'} (รอบ {currentRound})
            </p>
        </div>
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <button onClick={onStartPause} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-lg flex items-center gap-2 text-sm`}>
                {isActive ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>} {isActive ? 'หยุดชั่วคราว' : 'เริ่ม'}
            </button>
            <button onClick={onResetCurrent} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:${currentTheme.buttonSecondaryHoverBg}`}>
                <RotateCcw className="w-4 h-4"/> รีเซ็ตนาฬิกา
            </button>
            <button onClick={onSkip} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:${currentTheme.buttonSecondaryHoverBg}`}>
                <SkipForward className="w-4 h-4"/> ข้ามรอบ
            </button>
        </div>
        <details className="group">
            <summary className={`cursor-pointer ${currentTheme.textSecondary} hover:${currentTheme.text} text-sm list-none flex items-center`}>
                <ChevronDown className="w-4 h-4 mr-1 group-open:hidden"/>
                <ChevronUp className="w-4 h-4 mr-1 hidden group-open:inline"/>
                ตั้งค่า Pomodoro
            </summary>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                    <label htmlFor="pomodoroWork" className={`block mb-1 ${currentTheme.textSecondary} opacity-90`}>ทำงาน (นาที):</label>
                    <input type="number" id="pomodoroWork" name="work" value={tempConfig.work} onChange={onConfigChange} className={`w-full p-2 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`}/>
                </div>
                <div>
                    <label htmlFor="pomodoroShortBreak" className={`block mb-1 ${currentTheme.textSecondary} opacity-90`}>พักสั้น (นาที):</label>
                    <input type="number" id="pomodoroShortBreak" name="shortBreak" value={tempConfig.shortBreak} onChange={onConfigChange} className={`w-full p-2 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`}/>
                </div>
                <div>
                    <label htmlFor="pomodoroLongBreak" className={`block mb-1 ${currentTheme.textSecondary} opacity-90`}>พักยาว (นาที):</label>
                    <input type="number" id="pomodoroLongBreak" name="longBreak" value={tempConfig.longBreak} onChange={onConfigChange} className={`w-full p-2 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`}/>
                </div>
                <div>
                    <label htmlFor="pomodoroRounds" className={`block mb-1 ${currentTheme.textSecondary} opacity-90`}>รอบก่อนพักยาว:</label>
                    <input type="number" id="pomodoroRounds" name="rounds" value={tempConfig.rounds} onChange={onConfigChange} className={`w-full p-2 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`}/>
                </div>
            </div>
             <button onClick={onSaveConfig} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} mt-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2`}>
                <Save className="w-4 h-4"/> บันทึกการตั้งค่า
            </button>
        </details>
    </div>
  );
};

export default PomodoroTimer;