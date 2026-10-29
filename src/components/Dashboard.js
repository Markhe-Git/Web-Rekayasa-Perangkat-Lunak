'use client';
import { useState, useEffect } from 'react';

const statusLabels = {
  Pending: 'Menunggu', Approved: 'Disetujui', Rejected: 'Ditolak',
  Completed: 'Selesai', Cancelled: 'Dibatalkan',
};

function StatCard({ label, value, sub, icon, variant }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}

function RecentRow({ item }) {
  const statusClass = `badge badge-${item.StatusPeminjaman.toLowerCase()}`;
  return (
    <tr>
      <td>#{item.IdPeminjaman}</td>
      <td>{item.User?.Nama ?? '-'}</td>
      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.TujuanPinjam}</td>
      <td>{new Date(item.TglPengajuan).toLocaleDateString('id-ID')}</td>
      <td><span className={statusClass}>{statusLabels[item.StatusPeminjaman] ?? item.StatusPeminjaman}</span></td>
    </tr>
  );
}

export default function Dashboard({ currentUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async (r) => {
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          throw new Error(errData.Error || 'Gagal terhubung ke database. Pastikan MySQL aktif.');
        }
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div> Memuat dashboard...</div>;
  if (error) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-title">Dashboard</div>
        </div>
        <div className="page-body">
          <div className="alert alert-error">⚠ {error}</div>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { Stats, RecentPeminjaman } = data;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">Ringkasan sistem peminjaman barang HIMTIKA</div>
      </div>
      <div className="page-body">
        {currentUser && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                Selamat datang, {currentUser.Nama}! 👋
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {currentUser.Role === 'Admin'
                  ? 'Anda memiliki hak akses Administrator penuh ke seluruh modul sistem.'
                  : 'Anda masuk sebagai Anggota (Akses Dashboard, Peminjaman, dan Inventaris mode lihat).'}
              </div>
            </div>
            <span className={`role-pill ${currentUser.Role === 'Admin' ? 'pill-admin' : 'pill-member'}`}>
              {currentUser.Role === 'Admin' ? '🛡️ Administrator' : '👤 Anggota'}
            </span>
          </div>
        )}
        <div className="stat-grid">
          <StatCard label="Barang Tersedia" value={Stats.BarangTersedia} icon="📦" variant="accent" />
          <StatCard label="Menunggu Persetujuan" value={Stats.PeminjamanPending} icon="⏳" variant="warning" />
          <StatCard label="Sedang Dipinjam" value={Stats.BarangDipinjam} icon="🔄" variant="success" />
          <StatCard label="Total Pengguna" value={Stats.TotalUsers} icon="👥" variant="danger" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Peminjaman Terbaru</div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Peminjam</th><th>Tujuan</th><th>Tgl Pengajuan</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RecentPeminjaman.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Belum ada data</td></tr>
                    : RecentPeminjaman.map(item => <RecentRow key={item.IdPeminjaman} item={item} />)
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Rekap Status</div></div>
            <div className="card-body">
              {[
                { label: 'Pending', value: Stats.PeminjamanPending, cls: 'badge-pending' },
                { label: 'Disetujui', value: Stats.PeminjamanApproved, cls: 'badge-approved' },
                { label: 'Selesai', value: Stats.PeminjamanCompleted, cls: 'badge-completed' },
                { label: 'Ditolak', value: Stats.PeminjamanRejected, cls: 'badge-rejected' },
              ].map(({ label, value, cls }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className={`badge ${cls}`}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Kondisi Barang</div>
                {[
                  { label: 'Tersedia', value: Stats.BarangTersedia, cls: 'badge-tersedia' },
                  { label: 'Dipinjam', value: Stats.BarangDipinjam, cls: 'badge-dipinjam' },
                  { label: 'Maintenance', value: Stats.BarangMaintenance, cls: 'badge-maintenance' },
                ].map(({ label, value, cls }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className={`badge ${cls}`}>{label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
