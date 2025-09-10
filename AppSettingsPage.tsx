
import React, { useState } from 'react';
import { AppTheme, UserPreferences, NotificationPreferences, AiWriterPreferences, Project, ApiKeyMode } from './types'; 
import { Settings, Bell, CheckCircle, XCircle, Edit3, Save, Package, MapPin, Palette as PaletteIcon, Zap, Type as FontIcon, Edit, SlidersHorizontal, Brain, FileText, Trash2, Archive, Inbox, KeyRound, ListChecks, TrendingUp, Milestone, AlertTriangle } from 'lucide-react'; 
import { AVAILABLE_AI_MODELS, MODEL_NAME as DEFAULT_MODEL_NAME } from './frontend/src/constants'; 

interface AppSettingsPageProps {
    currentTheme: AppTheme;
    userPreferences: UserPreferences;
    setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
    projects: Project[];
    activeProjectId: string | null;
    onUpdateProjectDetails: (projectId: string, details: Partial<Pick<Project, 'name' | 'genre' | 'description' | 'isArchived'>>) => void;
    onDeleteProject: (projectId: string) => void;
}

const AppSettingsPage: React.FC<AppSettingsPageProps> = ({
    currentTheme,
    userPreferences,
    setUserPreferences,
    projects,
    activeProjectId,
    onUpdateProjectDetails,
    onDeleteProject,
}) => {
    const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'ai' | 'notifications' | 'projects' | 'roadmap'>('general');
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editableProjectDetails, setEditableProjectDetails] = useState<Partial<Pick<Project, 'name' | 'genre' | 'description'>>>({});
    const [showArchivedProjects, setShowArchivedProjects] = useState(false);
    const [tempApiKey, setTempApiKey] = useState(userPreferences.aiWriterPreferences.customGeminiApiKey || '');

    React.useEffect(() => {
        if (editingProjectId) {
            const projectToEdit = projects.find(p => p.id === editingProjectId);
            if (projectToEdit) {
                setEditableProjectDetails({
                    name: projectToEdit.name,
                    genre: projectToEdit.genre || '',
                    description: projectToEdit.description || '',
                });
            }
        } else {
            setEditableProjectDetails({});
        }
    }, [editingProjectId, projects]);

    const handleToggleNotification = (key: keyof NotificationPreferences) => {
        setUserPreferences(prev => ({
            ...prev,
            notificationPreferences: { ...prev.notificationPreferences, [key]: !prev.notificationPreferences[key] },
        }));
    };

    const handleAiWriterPreferenceChange = (key: keyof AiWriterPreferences, value: any) => {
        setUserPreferences(prev => ({
            ...prev,
            aiWriterPreferences: { ...prev.aiWriterPreferences, [key]: value },
        }));
    };
    
    const handleApiKeyChange = (value: string) => {
        setTempApiKey(value);
    };

    const handleSaveApiKey = () => {
        handleAiWriterPreferenceChange('customGeminiApiKey', tempApiKey.trim() === '' ? undefined : tempApiKey.trim());
        alert(tempApiKey.trim() === '' ? 'กลับไปใช้ API Key เริ่มต้น (หาก Backend กำหนดไว้)' : 'บันทึก Custom API Key ที่ป้อนแล้ว (เก็บใน Local Storage)');
    };
    
    const handleModelChange = (modelValue: string) => {
         handleAiWriterPreferenceChange('selectedAiModel', modelValue);
    };
    
    const handleApiKeyModeChange = (mode: ApiKeyMode) => {
        handleAiWriterPreferenceChange('apiKeyMode', mode);
        if (mode !== 'stored') { 
            // setTempApiKey(''); // Decided against auto-clearing temp key
        }
    };


    const handleFontFamilyChange = (fontFamilyValue: string) => {
        setUserPreferences(prev => ({ ...prev, selectedFontFamily: fontFamilyValue }));
        if (document.body) document.body.style.fontFamily = fontFamilyValue;
    };

    const handleProjectDetailChange = (field: keyof Pick<Project, 'name' | 'genre' | 'description'>, value: string) => {
        setEditableProjectDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProjectDetails = () => {
        if (editingProjectId && editableProjectDetails.name?.trim()) {
            onUpdateProjectDetails(editingProjectId, {
                name: editableProjectDetails.name.trim(),
                genre: editableProjectDetails.genre?.trim() || undefined,
                description: editableProjectDetails.description?.trim() || undefined,
            });
            alert(`บันทึกรายละเอียดโปรเจกต์ "${editableProjectDetails.name.trim()}" แล้ว`);
            setEditingProjectId(null);
        } else if (editingProjectId && !editableProjectDetails.name?.trim()) {
            alert('ชื่อโปรเจกต์ไม่สามารถเว้นว่างได้');
        }
    };

    const handleArchiveToggle = (projectId: string, archive: boolean) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const confirmMessage = archive
                ? `คุณแน่ใจหรือไม่ว่าต้องการเก็บถาวรโปรเจกต์ "${project.name}"?`
                : `คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเก็บถาวรโปรเจกต์ "${project.name}"?`;
            if (window.confirm(confirmMessage)) {
                onUpdateProjectDetails(projectId, { isArchived: archive });
                alert(`โปรเจกต์ "${project.name}" ${archive ? 'ถูกเก็บถาวรแล้ว' : 'ถูกยกเลิกการเก็บถาวรแล้ว'}`);
            }
        }
    };

    const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
    const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
    const optionClasses = `${currentTheme.cardBg} ${currentTheme.inputText}`;
    const inputBaseClass = `w-full p-2.5 rounded-lg ${currentTheme.inputBg || currentTheme.input} ${currentTheme.inputText || currentTheme.text} border ${currentTheme.inputBorder || 'border-gray-300 dark:border-slate-600'} focus:outline-none focus:ring-2 ${currentTheme.focusRing || 'focus:ring-indigo-500'} text-sm`;
    const selectBaseClass = `${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`;
    const tabButtonBase = `w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none ${currentTheme.focusRing || 'focus:ring-2 focus:ring-offset-1'}`;
    const activeTabClass = `${currentTheme.button} ${currentTheme.buttonText || 'text-white'}`;
    const inactiveTabClass = `${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} hover:${currentTheme.inputBg || 'bg-gray-100 dark:bg-slate-700'} hover:${currentTheme.text}`;

    const ToggleButton: React.FC<{ isEnabled: boolean; onToggle: () => void; labelId: string;}> = ({ isEnabled, onToggle, labelId }) => (
        <button
            role="switch" aria-checked={isEnabled} onClick={onToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none ${currentTheme.focusRing || 'focus:ring-2 focus:ring-offset-1'} ${isEnabled ? currentTheme.accent : (isDarkTheme ? 'bg-slate-600' : 'bg-gray-300')}`}
            aria-labelledby={labelId}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    const activeProjectsList = projects.filter(p => !p.isArchived).sort((a, b) => a.name.localeCompare(b.name, 'th'));
    const archivedProjectsList = projects.filter(p => p.isArchived).sort((a, b) => a.name.localeCompare(b.name, 'th'));

    const RoadmapItem: React.FC<{ title: string, status: 'Completed' | 'In Progress' | 'Planned' | 'Future', description?: string, subItems?: string[] }> = 
    ({ title, status, description, subItems }) => {
      let statusColor = '';
      let StatusIcon = CheckCircle;
      switch(status) {
          case 'Completed': statusColor = 'text-green-500'; StatusIcon = CheckCircle; break;
          case 'In Progress': statusColor = 'text-sky-500'; StatusIcon = TrendingUp; break;
          case 'Planned': statusColor = 'text-yellow-500'; StatusIcon = Milestone; break;
          case 'Future': statusColor = `${currentTheme.textSecondary} opacity-70`; StatusIcon = Brain; break;
      }
      return (
          <div className={`mb-3 p-3 rounded-md border ${currentTheme.inputBorder || 'border-gray-200 dark:border-slate-700'} ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'}`}>
              <div className="flex items-center justify-between">
                  <h4 className={`${currentTheme.text} font-medium flex items-center`}>
                    <StatusIcon size={16} className={`mr-2 ${statusColor}`} /> {title}
                  </h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor} bg-opacity-10 ${statusColor.replace('text-','bg-')}`}>{status}</span>
              </div>
              {description && <p className={`${currentTheme.textSecondary} text-xs mt-1 pl-6`}>{description}</p>}
              {subItems && subItems.length > 0 && (
                <ul className="list-disc list-inside pl-8 mt-1 text-xs">
                    {subItems.map((item, idx) => <li key={idx} className={`${currentTheme.textSecondary} opacity-80`}>{item}</li>)}
                </ul>
              )}
          </div>
      );
    };


    return (
        <div className="py-6">
            <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} mb-8 text-center flex items-center justify-center`}>
                <Settings className={`w-7 h-7 mr-3 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การตั้งค่า
            </h2>
            <div className="md:flex md:gap-6 lg:gap-8">
                <nav className={`md:w-1/4 lg:w-1/5 ${currentTheme.cardBg} p-3 sm:p-4 rounded-xl shadow-lg mb-6 md:mb-0 self-start`}>
                    <ul className="space-y-1">
                        <li><button onClick={() => setActiveSettingsTab('general')} className={`${tabButtonBase} ${activeSettingsTab === 'general' ? activeTabClass : inactiveTabClass}`}>ทั่วไป</button></li>
                        <li><button onClick={() => setActiveSettingsTab('ai')} className={`${tabButtonBase} ${activeSettingsTab === 'ai' ? activeTabClass : inactiveTabClass}`}>AI Writer</button></li>
                        <li><button onClick={() => setActiveSettingsTab('notifications')} className={`${tabButtonBase} ${activeSettingsTab === 'notifications' ? activeTabClass : inactiveTabClass}`}>การแจ้งเตือน</button></li>
                        <li><button onClick={() => setActiveSettingsTab('projects')} className={`${tabButtonBase} ${activeSettingsTab === 'projects' ? activeTabClass : inactiveTabClass}`}>จัดการโปรเจกต์</button></li>
                        <li><button onClick={() => setActiveSettingsTab('roadmap')} className={`${tabButtonBase} ${activeSettingsTab === 'roadmap' ? activeTabClass : inactiveTabClass}`}>Roadmap</button></li>
                    </ul>
                </nav>
                <div className="flex-1">
                    {activeSettingsTab === 'general' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <PaletteIcon className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การแสดงผล
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="font-family-select" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5 flex items-center`}>
                                        <FontIcon size={16} className="mr-2 opacity-70" /> รูปแบบตัวอักษร (Font):
                                    </label>
                                    <select
                                        id="font-family-select" value={userPreferences.selectedFontFamily || "'Sarabun', sans-serif"}
                                        onChange={(e) => handleFontFamilyChange(e.target.value)} className={`${selectBaseClass}`}
                                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                                    >
                                        <option value="'Sarabun', sans-serif" className={optionClasses}>สารบรรณ (Sarabun)</option>
                                        <option value="'Noto Sans Thai', sans-serif" className={optionClasses}>โนโต ซานส์ ไทย (Noto Sans Thai)</option>
                                        <option value="Arial, sans-serif" className={optionClasses}>Arial</option>
                                        <option value="Verdana, sans-serif" className={optionClasses}>Verdana</option>
                                        <option value="Tahoma, sans-serif" className={optionClasses}>Tahoma</option>
                                    </select>
                                    <p className={`text-xs ${currentTheme.textSecondary || 'text-gray-500 dark:text-slate-400'} opacity-80 mt-1`}>
                                        รูปแบบตัวอักษรที่เลือกจะมีผลกับทั้งแอปพลิเคชัน
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSettingsTab === 'ai' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Zap className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การตั้งค่า AI Writer
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5 flex items-center`}>
                                        <KeyRound size={16} className="mr-2 opacity-70" /> โหมดการใช้ API Key:
                                    </label>
                                    <div className="space-y-2">
                                        {(['server-default', 'stored', 'prompt'] as ApiKeyMode[]).map(mode => (
                                            <label key={mode} className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="apiKeyMode"
                                                    value={mode}
                                                    checked={userPreferences.aiWriterPreferences.apiKeyMode === mode}
                                                    onChange={() => handleApiKeyModeChange(mode)}
                                                    className={`form-radio h-4 w-4 ${currentTheme.accent.replace('bg-', 'text-')} border-gray-300 focus:ring-offset-0 focus:${currentTheme.focusRing}`}
                                                />
                                                <span className={`ml-2 text-sm ${currentTheme.text}`}>
                                                    {mode === 'server-default' && 'ใช้การตั้งค่าเริ่มต้นจากเซิร์ฟเวอร์ (แนะนำ)'}
                                                    {mode === 'stored' && 'ใช้ Custom API Key ที่บันทึกไว้ (เก็บใน Local Storage)'}
                                                    {mode === 'prompt' && 'ป้อน API Key เมื่อใช้งาน'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {userPreferences.aiWriterPreferences.apiKeyMode === 'stored' && (
                                        <div className="mt-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-300 text-xs flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            <span>การเก็บ API Key ใน Local Storage มีความปลอดภัยน้อยกว่าการใช้ผ่านเซิร์ฟเวอร์ โปรดใช้ด้วยความระมัดระวัง</span>
                                        </div>
                                    )}
                                     {userPreferences.aiWriterPreferences.apiKeyMode === 'server-default' && (
                                        <p className={`text-xs ${currentTheme.textSecondary || 'text-gray-500 dark:text-slate-400'} opacity-80 mt-1`}>
                                          แอปพลิเคชันจะเรียก API ผ่าน Backend ซึ่งควรมีการตั้งค่า API Key ไว้อย่างปลอดภัยบนเซิร์ฟเวอร์
                                        </p>
                                    )}
                                </div>

                                {userPreferences.aiWriterPreferences.apiKeyMode === 'stored' && (
                                  <div>
                                      <label htmlFor="custom-api-key" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5`}>
                                          Custom Gemini API Key:
                                      </label>
                                      <div className="flex gap-2 items-center">
                                        <input
                                          type="password" id="custom-api-key" value={tempApiKey}
                                          onChange={(e) => handleApiKeyChange(e.target.value)}
                                          className={`${inputBaseClass} flex-grow`}
                                          placeholder="วาง API Key ของคุณที่นี่"
                                        />
                                        <button onClick={handleSaveApiKey} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} text-sm px-4 py-2 rounded-md`}>บันทึก Key</button>
                                      </div>
                                  </div>
                                )}

                                <div>
                                    <label htmlFor="ai-model-select" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5 flex items-center`}>
                                      <ListChecks size={16} className="mr-2 opacity-70" /> เลือกโมเดล AI:
                                    </label>
                                    <select
                                        id="ai-model-select" value={userPreferences.aiWriterPreferences.selectedAiModel || DEFAULT_MODEL_NAME}
                                        onChange={(e) => handleModelChange(e.target.value)}
                                        className={`${selectBaseClass} w-full sm:w-2/3 md:w-1/2`}
                                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                                    >
                                        {AVAILABLE_AI_MODELS.map(model => (
                                            <option key={model} value={model} className={optionClasses}>{model}</option>
                                        ))}
                                    </select>
                                    <p className={`text-xs ${currentTheme.textSecondary || 'text-gray-500 dark:text-slate-400'} opacity-80 mt-1`}>
                                        เลือกโมเดล Gemini ที่ต้องการใช้งาน (แนะนำ: {DEFAULT_MODEL_NAME})
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="repetition-threshold" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5`}>
                                        เกณฑ์การแจ้งเตือนคำซ้ำ (จำนวนครั้ง):
                                    </label>
                                    <input
                                        type="number" id="repetition-threshold" min="1" max="10" step="1"
                                        value={userPreferences.aiWriterPreferences.repetitionThreshold}
                                        onChange={(e) => handleAiWriterPreferenceChange('repetitionThreshold', parseInt(e.target.value, 10))}
                                        className={`${inputBaseClass} w-full sm:w-1/2 md:w-1/3`}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span id="autoAddLoreLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>AI สร้างข้อมูลโลกอัตโนมัติจาก [[notation]] และ @mention:</span>
                                    <ToggleButton isEnabled={!!userPreferences.aiWriterPreferences.autoAddLoreFromAi} onToggle={() => handleAiWriterPreferenceChange('autoAddLoreFromAi', !userPreferences.aiWriterPreferences.autoAddLoreFromAi)} labelId="autoAddLoreLabel" />
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span id="autoAnalyzeScenesLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>AI วิเคราะห์ฉากใหม่ๆ อัตโนมัติ (ทดลอง):</span>
                                    <ToggleButton isEnabled={!!userPreferences.aiWriterPreferences.autoAnalyzeScenes} onToggle={() => handleAiWriterPreferenceChange('autoAnalyzeScenes', !userPreferences.aiWriterPreferences.autoAnalyzeScenes)} labelId="autoAnalyzeScenesLabel" />
                                </div>
                                <div>
                                    <label htmlFor="contextual-menu-style" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5`}>
                                        รูปแบบเมนู AI ตามบริบท:
                                    </label>
                                    <select
                                        id="contextual-menu-style" value={userPreferences.aiWriterPreferences.contextualAiMenuStyle || 'simple'}
                                        onChange={(e) => handleAiWriterPreferenceChange('contextualAiMenuStyle', e.target.value)}
                                        className={`${selectBaseClass} w-full sm:w-1/2 md:w-1/3`}
                                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                                    >
                                        <option value="simple" className={optionClasses}>แบบง่าย (Simple)</option>
                                        <option value="full" className={optionClasses}>แบบเต็ม (Full)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSettingsTab === 'notifications' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Bell className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การแจ้งเตือน
                            </h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between py-1">
                                    <span id="taskRemindersLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>แจ้งเตือน Pomodoro / งานที่ใกล้ครบกำหนด:</span>
                                    <ToggleButton isEnabled={userPreferences.notificationPreferences.taskReminders} onToggle={() => handleToggleNotification('taskReminders')} labelId="taskRemindersLabel" />
                                </div>
                                {userPreferences.notificationPreferences.taskReminders && (
                                    <p className={`text-xs ${currentTheme.textSecondary} opacity-80 p-2 rounded-md ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'} flex items-center gap-2`}>
                                        {('Notification' in window && Notification.permission === 'granted') ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                                        {('Notification' in window && Notification.permission === 'granted') ? 'การแจ้งเตือน Pomodoro ได้รับอนุญาตจากเบราว์เซอร์แล้ว' : 'อาจต้องอนุญาตการแจ้งเตือนในเบราว์เซอร์สำหรับเว็บนี้'}
                                    </p>
                                )}
                                <div className="flex items-center justify-between py-1">
                                    <span id="projectUpdatesLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>แจ้งเตือนสรุปความคืบหน้าโครงการ (เร็วๆ นี้):</span>
                                    <ToggleButton isEnabled={userPreferences.notificationPreferences.projectUpdates} onToggle={() => handleToggleNotification('projectUpdates')} labelId="projectUpdatesLabel" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSettingsTab === 'projects' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Package className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> จัดการโปรเจกต์
                            </h3>
                            {activeProjectsList.length === 0 && !showArchivedProjects && <p className={`${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} italic`}>ยังไม่มีโปรเจกต์ที่ใช้งาน</p>}
                            {activeProjectsList.map(project => (
                                <div key={project.id} className={`p-3 rounded-md mb-2 ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'} border ${currentTheme.inputBorder || 'border-gray-200 dark:border-slate-700'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className={`${currentTheme.text} font-medium`}>{project.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingProjectId(project.id === editingProjectId ? null : project.id)} className={`${currentTheme.textSecondary} hover:opacity-70 p-1`} title="แก้ไขรายละเอียด"><Edit3 size={16} /></button>
                                            <button onClick={() => handleArchiveToggle(project.id, true)} className={`${currentTheme.textSecondary} hover:opacity-70 p-1`} title="เก็บถาวร"><Archive size={16} /></button>
                                            <button onClick={() => onDeleteProject(project.id)} className="text-red-500 hover:text-red-400 p-1" title="ลบถาวร"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    {editingProjectId === project.id && (
                                        <div className={`mt-3 pt-3 border-t ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} space-y-3`}>
                                            <div>
                                                <label htmlFor={`projectName-${project.id}`} className={`${currentTheme.textSecondary} text-xs block mb-0.5`}>ชื่อโปรเจกต์:</label>
                                                <input type="text" id={`projectName-${project.id}`} value={editableProjectDetails.name || ''} onChange={(e) => handleProjectDetailChange('name', e.target.value)} className={`${inputBaseClass}`} />
                                            </div>
                                            <div>
                                                <label htmlFor={`projectGenre-${project.id}`} className={`${currentTheme.textSecondary} text-xs block mb-0.5`}>ประเภท (Genre):</label>
                                                <input type="text" id={`projectGenre-${project.id}`} value={editableProjectDetails.genre || ''} onChange={(e) => handleProjectDetailChange('genre', e.target.value)} className={`${inputBaseClass}`} />
                                            </div>
                                            <div>
                                                <label htmlFor={`projectDesc-${project.id}`} className={`${currentTheme.textSecondary} text-xs block mb-0.5`}>คำอธิบาย:</label>
                                                <textarea id={`projectDesc-${project.id}`} value={editableProjectDetails.description || ''} onChange={(e) => handleProjectDetailChange('description', e.target.value)} rows={2} className={`${inputBaseClass} resize-y`} />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setEditingProjectId(null)} className={`${currentTheme.buttonSecondaryBg || 'bg-gray-200 dark:bg-slate-700'} ${currentTheme.buttonSecondaryText || 'text-gray-700 dark:text-slate-200'} text-xs px-3 py-1.5 rounded-md`}>ยกเลิก</button>
                                                <button onClick={handleSaveProjectDetails} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} text-xs px-4 py-1.5 rounded-md`}>บันทึก</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className={`mt-4 pt-4 border-t ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'}`}>
                                <button onClick={() => setShowArchivedProjects(!showArchivedProjects)} className={`${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} text-sm flex items-center hover:opacity-100`}>
                                    {showArchivedProjects ? <XCircle size={16} className="mr-1.5" /> : <Inbox size={16} className="mr-1.5" />}
                                    {showArchivedProjects ? 'ซ่อนโปรเจกต์ที่เก็บถาวร' : `แสดงโปรเจกต์ที่เก็บถาวร (${archivedProjectsList.length})`}
                                </button>
                                {showArchivedProjects && (
                                    <div className="mt-3 space-y-2">
                                        {archivedProjectsList.length === 0 && <p className={`${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} text-sm italic`}>ไม่มีโปรเจกต์ที่ถูกเก็บถาวร</p>}
                                        {archivedProjectsList.map(project => (
                                            <div key={project.id} className={`p-3 rounded-md ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'} bg-opacity-70 border ${currentTheme.inputBorder || 'border-gray-200 dark:border-slate-700'} opacity-80`}>
                                                <div className="flex justify-between items-center">
                                                    <span className={`${currentTheme.text} font-medium`}>{project.name} (เก็บถาวร)</span>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleArchiveToggle(project.id, false)} className={`${currentTheme.textSecondary} hover:opacity-100 p-1`} title="ยกเลิกการเก็บถาวร"><Inbox size={16} /></button>
                                                        <button onClick={() => onDeleteProject(project.id)} className="text-red-500 hover:text-red-400 p-1" title="ลบถาวร"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                     {activeSettingsTab === 'roadmap' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Milestone className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> แผนการพัฒนา (Roadmap)
                            </h3>
                            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                                <RoadmapItem title="ส่วน Core เสร็จสมบูรณ์" status="Completed" description="พื้นฐานการจัดการข้อมูล, AI Writer (Gemini), ระบบธีม, เครื่องมือเสริม, World Anvil, Plot Outline, และ Publishing Hub (แม่แบบ, Longform, Export เบื้องต้น)" />
                                
                                <RoadmapItem 
                                    title="ปรับปรุงระบบนำเข้า/ส่งออกข้อมูล" 
                                    status="In Progress" 
                                    description="เพิ่มความสามารถให้กับการนำเข้าและส่งออกไฟล์"
                                    subItems={[
                                        "AI ช่วย Tag/จัดหมวดหมู่ไฟล์นำเข้า",
                                        "จัดการ Conflict ของไฟล์นำเข้า (Merge, Rename, Overwrite)",
                                        "Batch Export (ส่งออกหลายโน้ตพร้อมกัน เช่น .zip, ePub)",
                                        "Custom CSS สำหรับ Export Template",
                                        "ส่งออกเอกสาร Longform"
                                    ]}
                                />
                                <RoadmapItem 
                                    title="Graph View - แสดงผลเต็มรูปแบบ" 
                                    status="In Progress"
                                    description="พัฒนา Graph View ให้สามารถแสดงความสัมพันธ์ของข้อมูลได้หลากหลายและโต้ตอบได้"
                                    subItems={[
                                        "Filtering และ Highlighting Nodes/Edges",
                                        "Visual Lore Relationship Mapping (เชื่อมโยงข้อมูลตัวละคร, สถานที่)",
                                        "การแสดงผลลิงก์ [[ชื่อโน้ต]] แบบไดนามิกในกราฟ"
                                    ]}
                                />
                                <RoadmapItem 
                                    title="Ashval AI Mascot - Phase 2" 
                                    status="In Progress"
                                    description="พัฒนา Mascot ให้มีประโยชน์และโต้ตอบได้มากขึ้น (AI Chat ยังอยู่ในขั้น Planned)"
                                    subItems={[
                                        "แสดง Tips ตามบริบทการใช้งาน",
                                        "ปรับปรุง UI Panel ของ Mascot"
                                    ]}
                                />
                                <RoadmapItem 
                                    title="ปรับปรุง UX/UI และ Performance" 
                                    status="In Progress"
                                    description="ปรับปรุงประสบการณ์ผู้ใช้โดยรวมและความเร็วของแอป"
                                    subItems={[
                                        "เพิ่ม Keyboard Shortcuts สำหรับคำสั่งที่ใช้บ่อย",
                                        "ปรับปรุงการทำงานแบบ Offline เบื้องต้น",
                                        "แก้ไข Bug และขัดเกลา UI โดยรวม"
                                    ]}
                                />

                                <h4 className={`${currentTheme.text} text-md font-semibold mt-4 mb-2 opacity-90`}>ที่วางแผนไว้ (Planned)</h4>
                                <RoadmapItem title="Advanced Note Editor Features" status="Planned" subItems={["Split View (Editor/Preview)", "WYSIWYG Mode (ทางเลือก)", "Version Diff/Merge"]} />
                                <RoadmapItem title="Enhanced Note Customization" status="Planned" subItems={["เครื่องมือ Crop ภาพปก", "Recently Used/Favorite Emojis"]} />
                                <RoadmapItem title="Advanced Task Management" status="Planned" subItems={["AI ช่วยประเมินเวลา/จัดลำดับความสำคัญงาน", "Task Dependencies (งาน A ต้องเสร็จก่อน B)"]} />
                                <RoadmapItem title="Advanced Lore Management & Visualization" status="Planned" subItems={["Custom Fields สำหรับ Lore Entries", "Visual Relationship Mapping ใน Graph View"]} />
                                <RoadmapItem title="Interactive Lore Timeline" status="Planned" description="Timeline ที่สามารถคลิกดูรายละเอียดเหตุการณ์และ Lore ที่เกี่ยวข้องได้" />
                                <RoadmapItem title="Advanced Plot Outline Features" status="Planned" subItems={["Plot Templates (Hero's Journey, Three-Act)", "Progress Tracking สำหรับ Plot Points"]} />
                                <RoadmapItem title="AI Plot Analysis Tools" status="Planned" subItems={["AI ช่วยวิเคราะห์ Pacing ของโครงเรื่อง", "AI ช่วยเสนอ 'What If' Scenarios"]} />
                                <RoadmapItem title="Advanced User Templates" status="Planned" subItems={["Dynamic Placeholders ({{current_date}})", "Template Variables (ให้ผู้ใช้กรอกเมื่อใช้แม่แบบ)"]} />
                                <RoadmapItem title="AI Writer Enhancements" status="Planned" subItems={["Contextual Prompts (AI แนะนำ Prompt ตามบริบท)", "AI Model Selection Advice", "Diff View ก่อนแทรกผลลัพธ์ AI"]} />
                                <RoadmapItem title="Pomodoro Timer Enhancements" status="Planned" subItems={["Task Association (ผูก Session กับงานที่ทำ)"]} />
                                <RoadmapItem title="Dictionary/Thesaurus Expansion" status="Planned" description="เพิ่ม Thesaurus (คำพ้อง/คำตรงข้าม) ใน Dictionary" />
                                <RoadmapItem title="Interactive AI Mascot" status="Planned" description="Mascot ที่สามารถสนทนาและให้คำแนะนำผ่าน AI, ระบบ Gamification" />
                                <RoadmapItem title="Content Analytics Dashboard" status="Planned" description="แดชบอร์ดแสดงผลวิเคราะห์เนื้อหา (Readability Score, Sentiment Arc, Word Clouds)" />
                                <RoadmapItem title="AI Contextual Menu ใน Note Editor" status="Planned" description="เมนู AI ที่ปรากฏเมื่อเลือกข้อความใน Note Editor" />
                                <RoadmapItem title="Advanced Notification System" status="Planned" description="แจ้งเตือนอัจฉริยะ (Smart Notifications) ตามพฤติกรรมผู้ใช้" />
                                <RoadmapItem title="Advanced Project Dashboard" status="Planned" subItems={["Customizable Widgets", "ระบบตั้งเป้าหมายโครงการ (Project Goals)"]} />

                                <h4 className={`${currentTheme.text} text-md font-semibold mt-4 mb-2 opacity-90`}>อนาคต (Future)</h4>
                                <RoadmapItem title="Offline First (Comprehensive)" status="Future" description="รองรับการทำงาน Offline เต็มรูปแบบสำหรับฟีเจอร์หลัก" />
                                <RoadmapItem title="Project Version Control (Experimental)" status="Future" description="ระบบ Version Control คล้าย Git แบบง่ายสำหรับโปรเจกต์" />
                                <RoadmapItem title="Third-party API Integrations & Developer API" status="Future" description="เปิด API ให้นักพัฒนาภายนอกสร้าง Plugin หรือเชื่อมต่อบริการอื่น" />
                                <RoadmapItem title="Collaboration Features" status="Future" description="ฟีเจอร์การทำงานร่วมกันบนโปรเจกต์ (อาจต้องใช้ Backend เต็มรูปแบบ)" />
                                <RoadmapItem title="Native Mobile App" status="Future" description="พัฒนาเป็นแอปพลิเคชันสำหรับมือถือ (iOS/Android)" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppSettingsPage;
