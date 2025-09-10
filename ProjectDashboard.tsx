
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppNote, AppTask, LoreEntry, Project, AppTheme } from './types';
import { BarChart2, ListChecks, FileText, TrendingUp, StickyNote, ListTodo, Bot, Clock, PieChart, Edit3 as EditIcon, CheckCircle, Activity, Zap, Coffee, Users, MapPin, Package as PackageIcon, Plus, Maximize, Briefcase, FileArchive as ArchiveIcon, GitBranch, Brain, BookOpen } from 'lucide-react';
import { Chart, registerables, ChartConfiguration, ChartItem } from 'chart.js/auto';

Chart.register(...registerables);

interface ProjectDashboardProps {
  notes: AppNote[];
  tasks: AppTask[];
  loreEntries: LoreEntry[];
  activeProject: Project | null | undefined;
  currentTheme: AppTheme;
  onNavigateTo: (path: string) => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  pomodoroCurrentMode: 'work' | 'shortBreak' | 'longBreak';
  pomodoroTimeLeft: number;
  formatPomodoroTime: (seconds: number) => string;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: JSX.Element; theme: AppTheme; details?: string; progress?: number; colorClass?: string }> = ({ title, value, icon, theme, details, progress, colorClass = theme.accent }) => {
    const iconColor = theme.accentText || colorClass.replace('bg-', 'text-');
    const progressBgColor = colorClass.startsWith('bg-') ? colorClass : `bg-${colorClass}-500`;
    
    return (
    <div className={`glass-card rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className={`${theme.textSecondary} text-xs sm:text-sm mb-1`}>{title}</p>
          <p className={`text-xl sm:text-2xl font-bold ${theme.text}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${colorClass} bg-opacity-10 flex items-center justify-center`}>
          {React.cloneElement(icon, { className: `w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`})}
        </div>
      </div>
      {progress !== undefined && details && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className={`${theme.textSecondary}`}>{details}</span>
          </div>
          <div className={`w-full h-1.5 sm:h-2 ${theme.inputBg} bg-opacity-30 rounded-full overflow-hidden`}>
            <div className={`h-full ${progressBgColor} rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

const QuickActionCard: React.FC<{ title: string; description: string; icon: JSX.Element; onClick: () => void; theme: AppTheme }> = ({ title, description, icon, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`glass-card rounded-xl shadow-md p-4 w-full text-left hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 ${theme.focusRing}`}
  >
    <div className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 ${theme.accent} bg-opacity-10 flex items-center justify-center mb-2 sm:mb-3`}>
       {React.cloneElement(icon, { className: `w-5 h-5 sm:w-6 sm:h-6 ${theme.accentText || theme.accent.replace('bg-','text-')}` })}
    </div>
    <h3 className={`font-semibold ${theme.text} text-sm sm:text-base`}>{title}</h3>
    <p className={`${theme.textSecondary} text-xs sm:text-sm`}>{description}</p>
  </button>
);

const ProgressBar: React.FC<{label: string, current: number, target: number, unit: string, colorClass: string, theme: AppTheme}> = ({label, current, target, unit, colorClass, theme}) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : (current > 0 ? 100 : 0); // If target is 0 but current > 0, show 100%
    const displayColor = colorClass.startsWith('bg-') ? colorClass : colorClass.startsWith('text-') ? colorClass.replace('text-','bg-') : `bg-${colorClass}-500`;
    return (
        <div className="mb-3 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <div className="flex justify-between items-center text-xs mb-1">
                <span className={`${theme.text}`}>{label}</span>
                <span className={`${theme.textSecondary}`}>{current.toLocaleString()}{target > 0 ? `/${target.toLocaleString()}`: ''} {unit} {target > 0 ? `(${Math.round(percentage)}%)` : ''}</span>
            </div>
            <div className={`w-full ${theme.inputBg} bg-opacity-30 rounded-full h-2 overflow-hidden`}>
                <div className={`h-2 rounded-full ${displayColor} transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}


const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  notes,
  tasks,
  loreEntries,
  activeProject,
  currentTheme,
  onNavigateTo,
  onOpenNoteModal,
  onOpenTaskModal,
  pomodoroCurrentMode,
  pomodoroTimeLeft,
  formatPomodoroTime,
}) => {
  const activityChartRef = useRef<HTMLCanvasElement>(null);
  const contentDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstancesRef = useRef<{ activity?: Chart, contentDistribution?: Chart }>({});

  const projectData = useMemo(() => {
    const pNotes = activeProject ? notes.filter(n => n.projectId === activeProject.id) : notes;
    const pTasks = activeProject ? tasks.filter(t => t.projectId === activeProject.id) : tasks;
    const pLore = activeProject ? loreEntries.filter(l => l.projectId === activeProject.id) : loreEntries;
    return { projectNotes: pNotes, projectTasks: pTasks, projectLore: pLore };
  }, [notes, tasks, loreEntries, activeProject]);

  const { projectNotes, projectTasks, projectLore } = projectData;

  useEffect(() => {
    if (chartInstancesRef.current.activity) chartInstancesRef.current.activity.destroy();
    if (chartInstancesRef.current.contentDistribution) chartInstancesRef.current.contentDistribution.destroy();
    chartInstancesRef.current = {};

    const isDark = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
    const primaryTextColor = currentTheme.text.startsWith('text-') ? getComputedStyle(document.documentElement).getPropertyValue(`--color-${currentTheme.text.split('-')[1]}-${currentTheme.text.split('-')[2] || '500'}`) || '#333333' : currentTheme.text;
    const secondaryTextColor = currentTheme.textSecondary.startsWith('text-') ? getComputedStyle(document.documentElement).getPropertyValue(`--color-${currentTheme.textSecondary.split('-')[1]}-${currentTheme.textSecondary.split('-')[2] || '500'}`) || '#777777' : currentTheme.textSecondary;
    
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    const primaryAccentColor = currentTheme.accent?.startsWith('bg-') ? getComputedStyle(document.documentElement).getPropertyValue(`--color-${currentTheme.accent.split('-')[1]}-500`) || '#5D5CDE' : (currentTheme.accent || '#5D5CDE');

    if (activityChartRef.current) {
      const ctx = activityChartRef.current.getContext('2d') as ChartItem;
      chartInstancesRef.current.activity = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Placeholder labels
          datasets: [{
            label: 'กิจกรรม (ตัวอย่าง)', // Clarified it's sample data
            data: [120, 190, 300, 500, 250, 400, 320], // Placeholder data
            borderColor: primaryAccentColor,
            backgroundColor: `${primaryAccentColor}55`, 
            tension: 0.4,
            fill: true,
            pointBackgroundColor: primaryAccentColor,
            pointBorderColor: currentTheme.cardBg, 
            pointHoverBackgroundColor: currentTheme.cardBg,
            pointHoverBorderColor: primaryAccentColor,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, labels: { color: primaryTextColor, font: {size: 10} } } }, // Display legend for clarity
          scales: { 
            y: { beginAtZero: true, ticks: { color: primaryTextColor, font: { size: 10 } }, grid: { color: gridColor } }, 
            x: { ticks: { color: primaryTextColor, font: { size: 10 } }, grid: { display: false } } 
          },
          interaction: { intersect: false, mode: 'index' }
        }
      });
    }

    if (contentDistributionChartRef.current) {
        const noteCategories = projectNotes.reduce((acc, note) => { acc[note.category] = (acc[note.category] || 0) + 1; return acc; }, {} as Record<string, number>);
        const loreTypesData = projectLore.reduce((acc, lore) => { acc[lore.type] = (acc[lore.type] || 0) + 1; return acc; }, {} as Record<string, number>);
        
        const combined: Record<string, number> = {};
        Object.entries(noteCategories).forEach(([key, value]) => combined[`โน้ต: ${key}`] = value); // Prefixed for clarity
        Object.entries(loreTypesData).forEach(([key, value]) => combined[`ข้อมูลโลก: ${key}`] = value); // Prefixed for clarity

        const dataValues = Object.keys(combined).length > 0 ? Object.values(combined) : [1];
        const dataLabels = Object.keys(combined).length > 0 ? Object.keys(combined) : ['ไม่มีข้อมูล']; // Clarified
      
        const chartColors = [
            primaryAccentColor, 
            currentTheme.buttonSecondaryBg?.startsWith('bg-') ? (getComputedStyle(document.documentElement).getPropertyValue(`--color-${currentTheme.buttonSecondaryBg.split('-')[1]}-500`) || '#38B2AC') : (currentTheme.buttonSecondaryBg || '#38B2AC'),
            '#FF9F5A', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'
        ];
        const backgroundColors = dataLabels.map((_, i) => chartColors[i % chartColors.length]);

      const ctx = contentDistributionChartRef.current.getContext('2d') as ChartItem;
      chartInstancesRef.current.contentDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: dataLabels, datasets: [{ data: dataValues, backgroundColor: backgroundColors, borderWidth: 0, hoverOffset: 8 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '70%',
          plugins: { legend: { position: 'bottom', labels: { color: primaryTextColor, usePointStyle: true, boxWidth: 8, padding: 15, font: {size: 10} } } }
        }
      });
    }
    return () => {
      if (chartInstancesRef.current.activity) chartInstancesRef.current.activity.destroy();
      if (chartInstancesRef.current.contentDistribution) chartInstancesRef.current.contentDistribution.destroy();
    };
  }, [currentTheme, projectNotes, projectLore, projectData]); 

  const totalNotes = projectNotes.length;
  const completedTasks = projectTasks.filter(task => task.completed).length;
  const totalTasks = projectTasks.length;
  const writingStreakDisplay = "N/A"; // Changed from placeholder 12
  const totalWords = projectNotes.reduce((sum, note) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    return sum + (tempDiv.textContent || tempDiv.innerText || "").trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const writingTimeThisWeek = "24.5 ชม."; 
  const aiUsageThisMonth = 32;
  const notesAddedThisWeek = Math.max(1, Math.round(totalNotes * 0.12)); 

  const fabAction = () => {
    onOpenNoteModal();
  };

  return (
    <div className={`py-4 sm:py-6 px-1 sm:px-0 animate-fadeIn ${currentTheme.text}`}>
      <header className="mb-6 sm:mb-8 px-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold">แดชบอร์ด {activeProject ? `: ${activeProject.name}` : ''}</h1>
                <p className={`${currentTheme.textSecondary} text-sm`}>ภาพรวมโปรเจกต์และการใช้งานล่าสุด</p>
            </div>
             <div className="flex space-x-2 mt-3 md:mt-0">
                <div className={`glass-card rounded-lg shadow-sm px-3 py-1.5 flex items-center`}>
                    <TrendingUp size={16} className="text-orange-500 mr-2" />
                    <div>
                        <div className={`text-xs ${currentTheme.textSecondary}`}>ความต่อเนื่อง</div>
                        <div className="font-medium text-sm">{writingStreakDisplay}</div>
                    </div>
                </div>
                <div className={`glass-card rounded-lg shadow-sm px-3 py-1.5 flex items-center`}>
                    <EditIcon size={16} className={`${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} mr-2`} />
                    <div>
                        <div className={`text-xs ${currentTheme.textSecondary}`}>คำทั้งหมด</div>
                        <div className="font-medium text-sm">{totalWords.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 px-2">
        <StatCard title="โน้ตทั้งหมด" value={totalNotes} icon={<FileText />} theme={currentTheme} details={`+${notesAddedThisWeek} สัปดาห์นี้`} progress={totalNotes > 0 ? (notesAddedThisWeek / Math.max(totalNotes,10)) * 100 : 0} colorClass={currentTheme.accent.split('-')[0]+"-blue-500"}/>
        <StatCard title="งานเสร็จสมบูรณ์" value={`${completedTasks}/${totalTasks}`} icon={<ListChecks />} theme={currentTheme} details={`${Math.round((completedTasks/ (totalTasks||1) )*100)}% สำเร็จ`} progress={(completedTasks/(totalTasks||1))*100} colorClass="bg-green-500"/>
        <StatCard title="เวลาเขียน (สัปดาห์นี้)" value={writingTimeThisWeek} icon={<Activity />} theme={currentTheme} details="เป้าหมาย 40 ชม." progress={(24.5/40)*100} colorClass="bg-purple-500"/>
        <StatCard title="การใช้ AI (เดือนนี้)" value={aiUsageThisMonth} icon={<Bot />} theme={currentTheme} details="3 โหมดใช้งานบ่อย" progress={60} colorClass="bg-orange-500"/>
      </section>
      
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 px-2">
        <QuickActionCard title="เพิ่มงาน" description="จัดการสิ่งที่ต้องทำ" icon={<ListTodo />} onClick={onOpenTaskModal} theme={currentTheme} />
        <QuickActionCard title="AI Writer" description="ให้ AI ช่วยเขียน" icon={<Zap />} onClick={() => onNavigateTo('/ai')} theme={currentTheme} />
        <QuickActionCard title="Pomodoro" description="เริ่มโฟกัส" icon={<Clock />} onClick={() => onNavigateTo('/tasks')} theme={currentTheme} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8 px-2">
        <div className={`glass-card rounded-xl shadow-lg p-4 sm:p-6 lg:col-span-2`}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">กิจกรรมการเขียน (ตัวอย่าง 7 วันล่าสุด)</h3>
          <div className="h-56 sm:h-64"><canvas ref={activityChartRef}></canvas></div>
        </div>
        <div className={`glass-card rounded-xl shadow-lg p-4 sm:p-6`}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">สัดส่วนเนื้อหา</h3>
             <div className="h-56 sm:h-64"><canvas ref={contentDistributionChartRef}></canvas></div>
        </div>
      </section>
      
      {activeProject && (
        <section className={`glass-card rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 mx-2`}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">ความคืบหน้าโปรเจกต์: {activeProject.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <ProgressBar label="เป้าหมายเนื้อเรื่อง (บท)" current={projectNotes.filter(n => n.category === 'chapter').length} target={activeProject.genre === 'นิยายขนาดสั้น' ? 12 : 25} unit="บท" colorClass={currentTheme.accent} theme={currentTheme} />
                <ProgressBar label="โน้ตทั้งหมดในโปรเจกต์" current={projectNotes.length} target={50} unit="โน้ต" colorClass="bg-yellow-500" theme={currentTheme}/>
                <ProgressBar label="งานในโปรเจกต์" current={projectTasks.filter(t=>t.completed).length} target={projectTasks.length} unit="งาน" colorClass="bg-green-500" theme={currentTheme}/>
                <ProgressBar label="ตัวละคร" current={projectLore.filter(l=>l.type === 'Character').length} target={10} unit="ตัวละคร" colorClass="bg-pink-500" theme={currentTheme}/>
                <ProgressBar label="ข้อมูลโลก" current={projectLore.length} target={30} unit="รายการ" colorClass="bg-indigo-500" theme={currentTheme}/>
            </div>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        <div className={`glass-card rounded-xl shadow-lg p-4 sm:p-5`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-base sm:text-lg font-semibold flex items-center"><FileText size={18} className="mr-2 opacity-80"/>โน้ตล่าสุด</h3>
                <button onClick={() => onNavigateTo('/notes')} className={`${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} text-xs sm:text-sm hover:underline`}>ดูทั้งหมด</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {projectNotes.slice(0, 3).map(note => (
                <div key={note.id} className={`p-2.5 rounded-lg hover:${currentTheme.inputBg} bg-opacity-50 cursor-pointer transition-colors`} onClick={() => onNavigateTo(`/notes`)}> {/* Consider onViewNote(note) if it navigates */}
                    <div className="flex items-center mb-0.5">
                        {note.icon && <span className="mr-1.5 text-base sm:text-md">{note.icon}</span>}
                        {!note.icon && <Maximize size={14} className={`${currentTheme.textSecondary} mr-1.5`} />}
                        <span className={`text-sm font-medium ${currentTheme.text} truncate`}>{note.title}</span>
                    </div>
                    <p className={`text-xs ${currentTheme.textSecondary} opacity-70`}>{new Date(note.updatedAt || note.createdAt).toLocaleDateString('th-TH', {day:'2-digit', month:'short'})}</p>
                </div>
            ))}
            {projectNotes.length === 0 && <p className={`${currentTheme.textSecondary} text-xs italic`}>ไม่มีโน้ต</p>}
            </div>
        </div>

        <div className={`glass-card rounded-xl shadow-lg p-4 sm:p-5`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-base sm:text-lg font-semibold flex items-center"><ListChecks size={18} className="mr-2 opacity-80"/>งานที่กำลังทำ</h3>
                 <button onClick={() => onNavigateTo('/tasks')} className={`${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} text-xs sm:text-sm hover:underline`}>ดูทั้งหมด</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {projectTasks.filter(t => !t.completed).slice(0, 3).map(task => (
                 <div key={task.id} className={`p-2.5 rounded-lg hover:${currentTheme.inputBg} bg-opacity-50 cursor-pointer transition-colors ${currentTheme.inputBg}`} onClick={() => onNavigateTo('/tasks')}>
                     <div className="flex items-center mb-0.5">
                        {task.icon && <span className="mr-1.5 text-base sm:text-md">{task.icon}</span>}
                        {!task.icon && <Briefcase size={14} className={`${currentTheme.textSecondary} mr-1.5`} />}
                        <span className={`text-sm font-medium ${currentTheme.text} ${task.completed ? 'line-through' : ''} truncate`}>{task.title}</span>
                    </div>
                    <p className={`text-xs ${currentTheme.textSecondary} opacity-70`}>{task.category}{task.dueDate ? ` - ${new Date(task.dueDate+'T00:00:00').toLocaleDateString('th-TH', {day:'2-digit', month:'short'})}` : ''}</p>
                </div>
            ))}
            {projectTasks.filter(t => !t.completed).length === 0 && <p className={`${currentTheme.textSecondary} text-xs italic`}>ไม่มีงานที่กำลังทำ</p>}
            </div>
        </div>
        
        <div className={`glass-card rounded-xl shadow-lg p-4 sm:p-5`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold flex items-center"><Brain size={18} className="mr-2 opacity-80"/>AI Writer ล่าสุด</h3>
              <button onClick={() => onNavigateTo('/ai')} className={`${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} text-xs sm:text-sm hover:underline`}>เปิด AI Writer</button>
            </div>
             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                 <div className={`p-2.5 rounded-lg hover:${currentTheme.inputBg} bg-opacity-50 cursor-pointer transition-colors`} onClick={() => onNavigateTo('/ai')}>
                    <p className={`text-sm font-medium ${currentTheme.text}`}>วิเคราะห์ตัวละคร: เอราเดีย</p>
                    <p className={`${currentTheme.textSecondary} text-xs opacity-70`}>เมื่อวาน, 14:35</p>
                </div>
                 <div className={`p-2.5 rounded-lg hover:${currentTheme.inputBg} bg-opacity-50 cursor-pointer transition-colors`} onClick={() => onNavigateTo('/ai')}>
                    <p className={`text-sm font-medium ${currentTheme.text}`}>สร้างฉากต่อสู้ในป่าสน</p>
                    <p className={`${currentTheme.textSecondary} text-xs opacity-70`}>2 วันที่แล้ว, 20:15</p>
                </div>
                 <div className={`p-2.5 rounded-lg hover:${currentTheme.inputBg} bg-opacity-50 cursor-pointer transition-colors`} onClick={() => onNavigateTo('/ai')}>
                    <p className={`text-sm font-medium ${currentTheme.text}`}>สรุปเนื้อเรื่องบทที่ 5</p>
                    <p className={`${currentTheme.textSecondary} text-xs opacity-70`}>3 วันที่แล้ว, 09:30</p>
                </div>
            </div>
        </div>
      </section>

       <div className={`glass-card rounded-xl shadow-lg p-4 sm:p-6 mt-6 text-center mx-2`}>
            <Clock size={20} className={`${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} mb-1.5 mx-auto`} />
            <p className={`text-2xl sm:text-3xl font-bold ${currentTheme.text}`}>{formatPomodoroTime(pomodoroTimeLeft)}</p>
            <p className={`${currentTheme.textSecondary} text-xs sm:text-sm mt-0.5`}>
                {pomodoroCurrentMode === 'work' ? 'Work Session' : pomodoroCurrentMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </p>
             <button onClick={() => onNavigateTo('/tasks')} className={`mt-2 text-xs ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} hover:underline font-medium py-1 px-2 rounded-md hover:${currentTheme.accent} hover:bg-opacity-10`}>
                ไปที่ Pomodoro Timer
            </button>
        </div>

      {/* Floating Action Button */}
      <button 
        onClick={fabAction} 
        className="fab-global text-white text-2xl animate-float" 
        title="เพิ่มโน้ตใหม่"
        aria-label="เพิ่มโน้ตใหม่"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default ProjectDashboard;
