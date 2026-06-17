import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar title={title} onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="page-content">
          <div className="page-main">{children}</div>
        </main>
      </div>
    </div>
  );
}
