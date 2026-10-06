'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Users from '@/components/Users';
import Kategori from '@/components/Kategori';
import Barang from '@/components/Barang';
import Peminjaman from '@/components/Peminjaman';

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <Users />;
      case 'kategori': return <Kategori />;
      case 'barang': return <Barang />;
      case 'peminjaman': return <Peminjaman />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="layout-wrapper">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
