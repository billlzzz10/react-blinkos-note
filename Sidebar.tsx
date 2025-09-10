
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LucideProps, LogOut, Settings, UserCircle } from 'lucide-react';
import { AppTheme } from './types';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType<LucideProps>;
  path: string;
  section?: 'main' | 'tools' | 'settings';
}

interface SidebarProps {
  navItems: NavItem[];
  currentTheme: AppTheme;
  isSidebarOpen: boolean; // Added for mobile control
  onNavigate: (path: string) => void; // To close sidebar on mobile nav
  userName?: string; 
  userRole?: string; 
  userAvatar?: string; 
}

const Sidebar: React.FC<SidebarProps> = ({ 
  navItems, 
  currentTheme,
  isSidebarOpen,
  onNavigate,
  userName = "คุณ Writer",
  userRole = "นักเขียนนิยาย",
  userAvatar, 
}) => {
  const location = useLocation();

  const mainNavItems = navItems.filter(item => item.section === 'main' || !item.section);
  const toolNavItems = navItems.filter(item => item.section === 'tools');
  const settingsNavItems = navItems.filter(item => item.section === 'settings');

  const handleLogoutClick = () => {
    alert("ฟังก์ชันออกจากระบบยังไม่เปิดใช้งาน");
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full w-60 lg:w-64 ${currentTheme.sidebarBg} ${currentTheme.sidebarBorder ? `border-r ${currentTheme.sidebarBorder}` : ''} 
                 flex flex-col transition-transform duration-300 ease-in-out shadow-lg z-30 pt-16 custom-scrollbar overflow-y-auto
                 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Main Navigation"
    >
      {/* User Profile Section */}
      <div className={`px-4 py-3 border-b ${currentTheme.divider} mb-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${currentTheme.accent} flex items-center justify-center text-white font-bold text-lg`}>
            {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" /> : userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={`text-sm font-semibold ${currentTheme.text}`}>{userName}</p>
            <p className={`text-xs ${currentTheme.textSecondary}`}>{userRole}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-grow px-3 py-2 space-y-1">
        <p className={`text-xs font-semibold ${currentTheme.textSecondary} uppercase px-3 mt-2 mb-1.5`}>เมนูหลัก</p>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => onNavigate(item.path)}
            end={item.path === '/'}
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group
              ${
                isActive
                  ? `${currentTheme.sidebarActiveBg} ${currentTheme.sidebarActiveText} shadow-sm`
                  : `${currentTheme.sidebarText} hover:${currentTheme.sidebarHoverBg} hover:${currentTheme.sidebarHoverText}`
              }`
            }
            aria-current={location.pathname === item.path ? 'page' : undefined}
          >
            <item.icon 
              className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 
              ${location.pathname === item.path ? currentTheme.sidebarActiveText : `${currentTheme.sidebarText} opacity-70 group-hover:${currentTheme.sidebarHoverText} group-hover:opacity-100`}`} 
            />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}

        {toolNavItems.length > 0 && (
          <>
            <p className={`text-xs font-semibold ${currentTheme.textSecondary} uppercase px-3 mt-4 mb-1.5`}>เครื่องมือ</p>
            {toolNavItems.map((item) => (
              <NavLink 
                key={item.id} 
                to={item.path} 
                onClick={() => onNavigate(item.path)}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group
                  ${
                    isActive
                      ? `${currentTheme.sidebarActiveBg} ${currentTheme.sidebarActiveText} shadow-sm`
                      : `${currentTheme.sidebarText} hover:${currentTheme.sidebarHoverBg} hover:${currentTheme.sidebarHoverText}`
                  }`
                }
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${location.pathname === item.path ? currentTheme.sidebarActiveText : `${currentTheme.sidebarText} opacity-70 group-hover:${currentTheme.sidebarHoverText} group-hover:opacity-100`}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
      
      {/* Bottom Controls */}
      <div className={`mt-auto px-3 py-3 border-t ${currentTheme.divider}`}>
        {settingsNavItems.map((item) => (
             <NavLink 
                key={item.id} 
                to={item.path}
                onClick={() => onNavigate(item.path)}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group
                  ${
                    isActive
                      ? `${currentTheme.sidebarActiveBg} ${currentTheme.sidebarActiveText} shadow-sm`
                      : `${currentTheme.sidebarText} hover:${currentTheme.sidebarHoverBg} hover:${currentTheme.sidebarHoverText}`
                  }`
                }
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${location.pathname === item.path ? currentTheme.sidebarActiveText : `${currentTheme.sidebarText} opacity-70 group-hover:${currentTheme.sidebarHoverText} group-hover:opacity-100`}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
        ))}
        <button 
            onClick={handleLogoutClick} 
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group
                       ${currentTheme.sidebarText} hover:${currentTheme.sidebarHoverBg} hover:text-red-400`}
            title="ออกจากระบบ (ยังไม่ทำงาน)"
        >
            <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100" />
            <span className="truncate">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
