
import React, { useState, useRef } from 'react';
import { AppTask, Project, PomodoroConfig } from '../types';
import { AppTheme } from '../types'; 
import TaskItem from './TaskItem';
import CategoryFilterControl from './CategoryFilterControl';
import PomodoroTimer from './PomodoroTimer';
import { Plus, Search, ListChecks, Clock, ChevronDown, ChevronUp, FileInput } from 'lucide-react';

interface TaskListProps {
    tasks: AppTask[];
    currentTheme: AppTheme;
    onToggleTask: (id: number) => void;
    onDeleteTask: (id: number) => void;
    onAddTask: () => void;
    onToggleSubtask: (taskId: number, subtaskId: string) => void;
    onAiDecomposeTaskRequest: (task: AppTask) => void;
    getPriorityColor: (priority: string) => string;
    getCategoryIcon: (category: string) => JSX.Element;
    projects: Project[];
    activeProjectId: string | null;
    // Pomodoro Props
    pomodoroConfig: PomodoroConfig;
    pomodoroTempConfig: PomodoroConfig;
    pomodoroCurrentMode: 'work' | 'shortBreak' | 'longBreak';
    pomodoroTimeLeft: number;
    pomodoroIsActive: boolean;
    pomodoroCurrentRound: number;
    onPomodoroStartPause: () => void;
    onPomodoroResetCurrent: () => void;
    onPomodoroSkip: () => void;
    onPomodoroConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPomodoroSaveConfig: () => void;
    formatPomodoroTime: (seconds: number) => string;
    onImportMarkdownForNewTask: (file: File) => void; // New prop for MD import
}

const TaskList: React.FC<TaskListProps> = ({
    tasks,
    currentTheme,
    onToggleTask,
    onDeleteTask,
    onAddTask,
    onToggleSubtask,
    onAiDecomposeTaskRequest,
    getPriorityColor,
    getCategoryIcon,
    projects,
    activeProjectId,
    pomodoroConfig,
    pomodoroTempConfig,
    pomodoroCurrentMode,
    pomodoroTimeLeft,
    pomodoroIsActive,
    pomodoroCurrentRound,
    onPomodoroStartPause,
    onPomodoroResetCurrent,
    onPomodoroSkip,
    onPomodoroConfigChange,
    onPomodoroSaveConfig,
    formatPomodoroTime,
    onImportMarkdownForNewTask,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
    const [showCompleted, setShowCompleted] = useState(true);
    const [showPomodoroPanel, setShowPomodoroPanel] = useState(false);
    const importTaskFileInputRef = useRef<HTMLInputElement>(null);

    const projectTasks = tasks.filter(task =>
        !activeProjectId || task.projectId === activeProjectId || task.projectId === null
    );

    const filteredTasks = projectTasks
        .filter(task => activeCategoryFilter === 'all' || task.category.toLowerCase() === activeCategoryFilter.toLowerCase())
        .filter(task => showCompleted || !task.completed)
        .filter(task =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.subtasks && task.subtasks.some(st => st.title.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    const allCategories = ['all', ...Array.from(new Set(projectTasks.map(task => task.category.toLowerCase())))];

    const getProjectName = (projectId?: string | null) => {
        if (!projectId) return undefined;
        return projects.find(p => p.id === projectId)?.name;
    };
    
    const handleImportTaskFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportMarkdownForNewTask(file);
        }
        if (importTaskFileInputRef.current) {
            importTaskFileInputRef.current.value = ""; // Reset file input
        }
    };

    return (
        <div className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} flex items-center`}>
                    <ListChecks className={`w-7 h-7 mr-2 ${currentTheme.accent.replace('bg-', 'text-')}`} />
                    รายการงาน ({filteredTasks.filter(t => !t.completed).length} ที่ยังไม่เสร็จ)
                </h2>
                <div className="flex gap-3 flex-wrap justify-center">
                    <button
                        onClick={() => setShowPomodoroPanel(!showPomodoroPanel)}
                        className={`${currentTheme.buttonSecondaryBg || 'bg-gray-200'} ${currentTheme.buttonSecondaryText || 'text-gray-700'} px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity`}
                        aria-expanded={showPomodoroPanel}
                        aria-controls="pomodoro-timer-panel"
                    >
                        <Clock size={16} />
                        Pomodoro
                        {showPomodoroPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <input 
                        type="file" 
                        accept=".md" 
                        ref={importTaskFileInputRef} 
                        onChange={handleImportTaskFileSelect} 
                        style={{ display: 'none' }} 
                        aria-label="Import Markdown for new task file"
                    />
                    <button
                        onClick={() => importTaskFileInputRef.current?.click()}
                        className={`${currentTheme.buttonSecondaryBg || 'bg-gray-200'} ${currentTheme.buttonSecondaryText || 'text-gray-700'} px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity`}
                        title="นำเข้า Markdown เป็นงานใหม่"
                    >
                        <FileInput size={16} /> นำเข้า MD
                    </button>
                    <button
                        onClick={onAddTask}
                        className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm`}
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> เพิ่มงาน
                    </button>
                </div>
            </div>

            {showPomodoroPanel && (
                <div id="pomodoro-timer-panel" className="mb-6">
                    <PomodoroTimer
                        config={pomodoroConfig}
                        tempConfig={pomodoroTempConfig}
                        currentMode={pomodoroCurrentMode}
                        timeLeft={pomodoroTimeLeft}
                        isActive={pomodoroIsActive}
                        currentRound={pomodoroCurrentRound}
                        currentTheme={currentTheme}
                        onStartPause={onPomodoroStartPause}
                        onResetCurrent={onPomodoroResetCurrent}
                        onSkip={onPomodoroSkip}
                        onConfigChange={onPomodoroConfigChange}
                        onSaveConfig={onPomodoroSaveConfig}
                        formatTime={formatPomodoroTime}
                    />
                </div>
            )}
            
            <div className={`mb-4 p-3 rounded-lg ${currentTheme.cardBg} bg-opacity-70`}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ค้นหางาน (ชื่อ, ประเภท, งานย่อย, รายละเอียด)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full py-2.5 pl-10 pr-4 rounded-lg ${currentTheme.inputBg || currentTheme.input} ${currentTheme.inputText || currentTheme.text} border ${currentTheme.inputBorder || 'border-transparent'} focus:outline-none focus:ring-2 ${currentTheme.focusRing || currentTheme.accent.replace('bg-', 'focus:ring-')}`}
                        aria-label="ค้นหางาน"
                    />
                    <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary || currentTheme.text} opacity-50`} />
                </div>
            </div>

            <CategoryFilterControl
                categories={allCategories}
                activeFilter={activeCategoryFilter}
                onFilterChange={setActiveCategoryFilter}
                getCategoryIcon={getCategoryIcon}
                currentTheme={currentTheme}
                label="กรองตามประเภทงาน"
            />

            <div className="mb-4">
                <label htmlFor="show-completed-tasks" className={`inline-flex items-center cursor-pointer ${currentTheme.textSecondary || currentTheme.text}`}>
                    <input
                        type="checkbox"
                        id="show-completed-tasks"
                        checked={showCompleted}
                        onChange={() => setShowCompleted(!showCompleted)}
                        className="form-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-2"
                    />
                    แสดงงานที่เสร็จแล้ว
                </label>
            </div>

            {filteredTasks.length === 0 ? (
                <p className={`${currentTheme.textSecondary || currentTheme.text} opacity-70 italic text-center py-8`}>
                    {searchTerm ? `ไม่พบงานที่ตรงกับคำค้นหา "${searchTerm}"` :
                     (activeCategoryFilter !== 'all' && !projectTasks.some(task => task.category.toLowerCase() === activeCategoryFilter.toLowerCase())) ? `ไม่พบงานในประเภท "${activeCategoryFilter}"` :
                     projectTasks.length === 0 ? "ยังไม่มีงาน เริ่มสร้างงานใหม่ได้เลย!" :
                     !showCompleted && !projectTasks.some(task => !task.completed) ? "งานทั้งหมดเสร็จสิ้นแล้ว!" :
                     "ไม่พบงานตามตัวกรองปัจจุบัน"
                    }
                </p>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            currentTheme={currentTheme}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onToggleSubtask={onToggleSubtask}
                            onAiDecomposeTaskRequest={onAiDecomposeTaskRequest}
                            getPriorityColor={getPriorityColor}
                            getCategoryIcon={getCategoryIcon}
                            projectName={getProjectName(task.projectId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskList;