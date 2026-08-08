import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleToggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors antialiased">
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar Component */}
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={handleCloseMobile}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Navbar Component */}
          <Navbar
            onToggleSidebar={handleToggleMobile}
            isSidebarOpen={isMobileOpen}
          />

          {/* Main Dashboard Children */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>

          {/* Footer Component */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
