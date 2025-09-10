
import React, { useState } from 'react';
import { AppTheme } from './types';
import ThemeSelector from './ThemeSelector';
import { Menu, Bell, HelpCircle, Edit3 } from 'lucide-react'; // Added Edit3 for fallback
import ProjectSelector from './ProjectSelector'; 
import { Project } from './types';


interface HeaderProps {
  currentTheme: AppTheme;
  themes: Record<string, AppTheme>;
  activeThemeKey: string;
  setActiveTheme: (themeKey: string) => void;
  onToggleSidebar?: () => void; 
  projects: Project[]; 
  activeProjectId: string | null; 
  onSelectProject: (projectId: string | null) => void; 
  onCreateProject: (projectName: string) => void; 
}

const Header: React.FC<HeaderProps> = ({ 
  currentTheme, 
  themes, 
  activeThemeKey, 
  setActiveTheme,
  onToggleSidebar,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject
 }) => {
  const [logoError, setLogoError] = useState(false);

  const handleNotificationsClick = () => {
    alert("ฟังก์ชันการแจ้งเตือนยังไม่เปิดใช้งาน");
  };

  const handleHelpClick = () => {
    alert("ฟังก์ชันช่วยเหลือยังไม่เปิดใช้งาน");
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-16 ${currentTheme.headerBg} ${currentTheme.sidebarBorder ? `border-b ${currentTheme.sidebarBorder}`: ''} 
                 flex items-center justify-between px-4 sm:px-6 shadow-sm z-40 transition-colors duration-300`}
    >
      <div className="flex items-center">
        {/* Hamburger Menu Icon */}
        <button 
          onClick={onToggleSidebar} 
          className={`mr-2 p-2 rounded-full md:hidden ${currentTheme.headerText} hover:${currentTheme.sidebarHoverBg} transition-colors`}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Logo and App Name */}
        <div className="flex items-center flex-shrink-0">
            {logoError ? (
              <Edit3 className={`w-8 h-8 sm:w-9 sm:h-9 mr-2 ${currentTheme.headerText}`} aria-label="Ashval Writer's Suite Logo Fallback" />
            ) : (
              <img 
                  src="https://storage.googleapis.com/ashval-logo/ashval-logo-transparent-animated-v2.gif" 
                  alt="Ashval Writer's Suite Logo" 
                  className="w-8 h-8 sm:w-9 sm:h-9 mr-2"
                  onError={() => {
                    console.warn("Failed to load Ashval logo GIF. Displaying fallback icon.");
                    setLogoError(true);
                  }}
              />
            )}
            <h1 className={`text-lg sm:text-xl font-bold ${currentTheme.headerText} hidden sm:block whitespace-nowrap`}>
                Ashval Writer's Suite
            </h1>
            <h1 className={`text-lg font-bold ${currentTheme.headerText} sm:hidden`}>
                AWS
            </h1>
        </div>
      </div>
      
      {/* Center Element - Project Selector */}
      <div className="flex-1 flex justify-center items-center px-4">
        <ProjectSelector
            projects={projects.filter(p => !p.isArchived)}
            activeProjectId={activeProjectId}
            currentTheme={currentTheme}
            onSelectProject={onSelectProject}
            onCreateProject={onCreateProject}
        />
      </div>
      
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <ThemeSelector 
            themes={themes} 
            activeTheme={activeThemeKey} 
            currentThemeStyles={currentTheme} 
            setActiveTheme={setActiveTheme} 
        />
         <button 
            onClick={handleNotificationsClick}
            className={`p-2 rounded-full ${currentTheme.headerText} hover:${currentTheme.sidebarHoverBg} transition-colors`} 
            title="การแจ้งเตือน (ยังไม่ทำงาน)"
            aria-label="Notifications (placeholder)"
          >
          <Bell className="w-5 h-5" />
        </button>
        <button 
            onClick={handleHelpClick}
            className={`p-2 rounded-full ${currentTheme.headerText} hover:${currentTheme.sidebarHoverBg} transition-colors`} 
            title="ช่วยเหลือ (ยังไม่ทำงาน)"
            aria-label="Help (placeholder)"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
