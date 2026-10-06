'use client';

const navItems = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard', section: 'Utama' },
  { id: 'peminjaman', icon: '📋', label: 'Peminjaman', section: 'Transaksi' },
  { id: 'barang', icon: '📦', label: 'Inventaris Barang', section: 'Manajemen' },
  { id: 'kategori', icon: '🏷️', label: 'Kategori Barang', section: 'Manajemen' },
  { id: 'users', icon: '👥', label: 'Pengguna', section: 'Manajemen' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const sections = [...new Set(navItems.map(i => i.section))];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📌</div>
        <div className="sidebar-logo-text">
          <h1>Pintika</h1>
          <p>HIMTIKA</p>
        </div>
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
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">A</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Admin Pintika</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
