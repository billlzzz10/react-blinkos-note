
import React from 'react';
import { BarChart3, Info } from 'lucide-react';
import { AppTheme } from './types'; // Import AppTheme

interface ContentAnalyticsProps {
  currentTheme: AppTheme;
}

const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ currentTheme }) => {
  return (
    <div className={`py-6 ${currentTheme.text}`}>
      <h2 className={`text-2xl sm:text-3xl font-semibold mb-6 text-center flex items-center justify-center`}>
        <BarChart3 className={`w-7 h-7 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')}`} />
        สถิติและวิเคราะห์เนื้อหา
      </h2>
      <div className={`${currentTheme.cardBg} border ${currentTheme.cardBorder || 'border-transparent'} p-6 rounded-xl shadow-lg`}>
        <div className="flex flex-col items-center justify-center text-center h-64">
          <Info size={48} className={`${currentTheme.textSecondary || 'text-gray-500 dark:text-gray-400'} mb-4`} />
          <h3 className={`text-xl font-semibold mb-2 ${currentTheme.text}`}>
            Content Analytics Coming Soon
          </h3>
          <p className={`${currentTheme.textSecondary || 'text-gray-600 dark:text-gray-300'}`}>
            ส่วนนี้กำลังอยู่ในระหว่างการพัฒนา จะพร้อมให้ใช้งานเร็วๆ นี้เพื่อแสดงข้อมูลสถิติและวิเคราะห์เนื้อหาของคุณ
          </p>
          <p className={`${currentTheme.textSecondary || 'text-gray-500 dark:text-gray-400'} opacity-80 mt-2 text-xs`}>
            (ตัวอย่าง: กราฟจำนวนคำ, การกระจายหมวดหมู่, ความถี่ในการใช้คำสำคัญ)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalytics;
