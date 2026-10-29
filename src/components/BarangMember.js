'use client';
import { useState, useEffect, useCallback } from 'react';

export default function BarangMember({ currentUser }) {
  const [barang, setBarang] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchBarang = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterKategori) params.set('kategori', filterKategori);
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/barang?${params}`);
    const data = await res.json();
    setBarang(data);
    setLoading(false);
  }, [search, filterKategori, filterStatus]);

  useEffect(() => {
    fetch('/api/kategori').then(r => r.json()).then(setKategori);
  }, []);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">Inventaris Barang</div>
        <div className="page-subtitle">Katalog inventaris barang HIMTIKA (Mode Hanya Lihat)</div>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                id="search-barang"
                className="search-input"
                placeholder="Cari nama, kode inventaris..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              id="filter-kategori-barang"
              className="form-control"
              style={{ width: 180 }}
              value={filterKategori}
              onChange={e => setFilterKategori(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategori.map(k => (
                <option key={k.IdKategori} value={k.IdKategori}>{k.NamaKategori}</option>
              ))}
            </select>
            <select
              id="filter-status-barang"
              className="form-control"
              style={{ width: 150 }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="toolbar-right">
            <div className="readonly-badge" title="Anggota hanya memiliki hak akses melihat inventaris">
              🔒 Mode Hanya Lihat
            </div>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading"><div className="spinner"></div> Memuat...</div>
            ) : barang.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-text">Tidak ada barang ditemukan</div>
                <div className="empty-state-sub">Coba ubah filter pencarian</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Kode Inventaris</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Kondisi</th>
                    <th>Status</th>
                    <th>Peminjam Saat Ini</th>
                  </tr>
                </thead>
                <tbody>
                  {barang.map((b, i) => {
                    const activePeminjaman = b.DetailPeminjaman?.[0]?.Peminjaman;
                    return (
                      <tr key={b.IdBarang}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-accent)' }}>
                          {b.KodeInventaris}
                        </td>
                        <td>{b.NamaBarang}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{b.Kategori?.NamaKategori ?? '-'}</td>
                        <td>
                          <span className={`badge badge-${b.Kondisi.toLowerCase().replace(' ', '')}`}>
                            {b.Kondisi === 'RusakRingan' ? 'Rusak Ringan' : b.Kondisi === 'RusakBerat' ? 'Rusak Berat' : b.Kondisi}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${b.Status.toLowerCase()}`}>{b.Status}</span>
                        </td>
                        <td>
                          {b.Status === 'Dipinjam' && activePeminjaman ? (
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>
                                👤 {activePeminjaman.User?.Nama}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Hingga {new Date(activePeminjaman.TglRencanaKembali).toLocaleDateString('id-ID')}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
