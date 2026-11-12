'use client';
import { useState } from 'react';

const allNavItems = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard', section: 'Utama', roles: ['Admin', 'Anggota'] },
  { id: 'peminjaman', icon: '📋', label: 'Peminjaman', section: 'Transaksi', roles: ['Admin', 'Anggota'] },
  { id: 'barang', icon: '📦', label: 'Inventaris Barang', section: 'Manajemen', roles: ['Admin', 'Anggota'] },
  { id: 'kategori', icon: '🏷️', label: 'Kategori Barang', section: 'Manajemen', roles: ['Admin'] },
  { id: 'users', icon: '👥', label: 'Pengguna', section: 'Manajemen', roles: ['Admin'] },
  { id: 'profil', icon: '👤', label: 'Profil Saya', section: 'Akun', roles: ['Admin', 'Anggota'] },
];

export default function Sidebar({ activePage, onNavigate, currentUser, onLogout }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const role = currentUser?.Role || 'Admin';
  const navItems = allNavItems.filter(item => item.roles.includes(role));
  const sections = [...new Set(navItems.map(i => i.section))];

  const userInitial = currentUser?.Nama ? currentUser.Nama.charAt(0).toUpperCase() : (role === 'Admin' ? 'A' : 'M');

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Topbar (Hanya tampil pada layar <= 768px) */}
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label={isMobileOpen ? 'Tutup navigasi' : 'Buka navigasi'}
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>

        <div className="mobile-brand" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
          <span className="mobile-brand-icon">📌</span>
          <span className="mobile-brand-title">Pintika</span>
          <span className="mobile-brand-badge">{role === 'Admin' ? 'Admin' : 'Anggota'}</span>
        </div>

        <div
          className="mobile-avatar"
          onClick={() => handleNavClick('profil')}
          title="Buka Profil Saya"
        >
          {userInitial}
        </div>
      </header>

      {/* Backdrop overlay saat mobile drawer terbuka */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${isMobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📌</div>
          <div className="sidebar-logo-text">
            <h1 className="sidebar-logo-title">Pintika</h1>
            <p className="sidebar-logo-subtitle">HIMTIKA</p>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Tutup navigasi"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {navItems.filter(i => i.section === section).map(item => (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  className={`nav-item${activePage === item.id ? ' active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className={`sidebar-user${activePage === 'profil' ? ' active-user' : ''}`}
            onClick={() => handleNavClick('profil')}
            style={{ cursor: 'pointer' }}
            title="Buka profil saya"
          >
            <div className="sidebar-user-avatar">{userInitial}</div>
            <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
              <div className="sidebar-user-name" title={currentUser?.Nama || 'Admin Pintika'}>
                {currentUser?.Nama || 'Admin Pintika'}
              </div>
              <div className="sidebar-user-role">
                {role === 'Admin' ? 'Administrator' : 'Anggota HIMTIKA'}
              </div>
            </div>
            {onLogout && (
              <button
                id="btn-logout"
                className="sidebar-logout-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileOpen(false);
                  setShowLogoutModal(true);
                }}
                title="Keluar dari akun"
              >
                🚪 Keluar
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Modal Konfirmasi Keluar / Sign Out */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Konfirmasi Keluar</div>
              <button
                className="modal-close"
                onClick={() => setShowLogoutModal(false)}
                title="Tutup dialog"
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🚪</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                Keluar dari Akun?
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Apakah Anda yakin ingin keluar dari akun{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {currentUser?.Nama || 'ini'}
                </strong>? Anda harus memasukkan kredensial login kembali untuk mengakses sistem.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>
              <button
                id="btn-confirm-logout"
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
