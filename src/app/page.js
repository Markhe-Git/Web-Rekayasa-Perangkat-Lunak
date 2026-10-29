'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Users from '@/components/Users';
import Kategori from '@/components/Kategori';
import Barang from '@/components/Barang';
import BarangMember from '@/components/BarangMember';
import Peminjaman from '@/components/Peminjaman';
import PeminjamanMember from '@/components/PeminjamanMember';
import Login from '@/components/login';
import Register from '@/components/register';
import Profil from '@/components/profil';

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  // Restore authenticated session from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pintika_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading auth state:', e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('pintika_user', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
    setActivePage('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    // Otomatis login saat registrasi berhasil
    handleLoginSuccess(user);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('pintika_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error updating user state:', e);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('pintika_user');
    } catch (e) {
      console.error('Error removing user:', e);
    }
    setCurrentUser(null);
    setActivePage('dashboard');
    setAuthView('login');
  };

  const handleNavigate = (page) => {
    // Prevent Anggota from accessing users or kategori
    if (currentUser?.Role === 'Anggota' && (page === 'users' || page === 'kategori')) {
      setActivePage('dashboard');
      return;
    }
    setActivePage(page);
  };

  if (authLoading) {
    return (
      <div className="login-container">
        <div className="loading" style={{ flexDirection: 'column' }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
          <span style={{ marginTop: 12, fontSize: 14 }}>Memuat aplikasi...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login or Register Page
  if (!currentUser) {
    if (authView === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthView('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  const renderPage = () => {
    const isAnggota = currentUser.Role === 'Anggota';

    switch (activePage) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'peminjaman':
        return isAnggota ? (
          <PeminjamanMember currentUser={currentUser} />
        ) : (
          <Peminjaman currentUser={currentUser} />
        );
      case 'barang':
        return isAnggota ? (
          <BarangMember currentUser={currentUser} />
        ) : (
          <Barang currentUser={currentUser} />
        );
      case 'kategori':
        if (isAnggota) {
          return (
            <div className="page-content">
              <div className="alert alert-error" style={{ margin: 24 }}>
                ⛔ Akses Ditolak: Anggota tidak memiliki izin untuk mengelola Kategori Barang.
              </div>
            </div>
          );
        }
        return <Kategori />;
      case 'users':
        if (isAnggota) {
          return (
            <div className="page-content">
              <div className="alert alert-error" style={{ margin: 24 }}>
                ⛔ Akses Ditolak: Anggota tidak memiliki izin untuk mengelola Pengguna.
              </div>
            </div>
          );
        }
        return <Users />;
      case 'profil':
        return (
          <Profil
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        );
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  return (
    <div className="layout-wrapper">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
