import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main content: offset on desktop, full width on mobile */}
      <div className="flex-1 md:ml-60 min-w-0">
        {children}
      </div>
    </div>
  );
};

export default Layout;
