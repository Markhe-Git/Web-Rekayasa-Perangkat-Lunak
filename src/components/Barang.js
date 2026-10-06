'use client';
import { useState, useEffect, useCallback } from 'react';

function BarangModal({ barang, kategoriList, onClose, onSaved }) {
  const [form, setForm] = useState({
    IdKategori: '', KodeInventaris: '', NamaBarang: '', Kondisi: 'Baik', Status: 'Tersedia',
    ...barang && { IdKategori: barang.IdKategori, KodeInventaris: barang.KodeInventaris, NamaBarang: barang.NamaBarang, Kondisi: barang.Kondisi, Status: barang.Status },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isEdit = !!barang?.IdBarang;
      const res = await fetch(isEdit ? `/api/barang/${barang.IdBarang}` : '/api/barang', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.Error ?? 'Terjadi kesalahan.'); return; }
      onSaved();
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{barang?.IdBarang ? 'Edit Barang' : 'Tambah Barang'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠ {error}</div>}
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select id="input-kategori-barang" className="form-control" value={form.IdKategori} onChange={set('IdKategori')} required>
                <option value="">-- Pilih Kategori --</option>
                {kategoriList.map(k => <option key={k.IdKategori} value={k.IdKategori}>{k.NamaKategori}</option>)}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Kode Inventaris</label>
                <input id="input-kode-inv" className="form-control" value={form.KodeInventaris} onChange={set('KodeInventaris')} required placeholder="INV-PRJ-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Kondisi</label>
                <select id="input-kondisi" className="form-control" value={form.Kondisi} onChange={set('Kondisi')}>
                  <option value="Baik">Baik</option>
                  <option value="RusakRingan">Rusak Ringan</option>
                  <option value="RusakBerat">Rusak Berat</option>
                </select>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nama Barang</label>
                <input id="input-nama-barang" className="form-control" value={form.NamaBarang} onChange={set('NamaBarang')} required placeholder="Proyektor Epson EB-X400" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="input-status-barang" className="form-control" value={form.Status} onChange={set('Status')}>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dipinjam">Dipinjam</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button id="btn-submit-barang" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Barang() {
  const [barang, setBarang] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

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

  useEffect(() => { fetchBarang(); }, [fetchBarang]);

  const handleDelete = async (b) => {
    if (!confirm(`Hapus barang "${b.NamaBarang}"?`)) return;
    setDeleting(b.IdBarang);
    const res = await fetch(`/api/barang/${b.IdBarang}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.Error ?? 'Gagal menghapus.'); }
    else fetchBarang();
    setDeleting(null);
  };

  return (
    <div className="page-content">
      {modal !== null && (
        <BarangModal
          barang={modal === 'create' ? null : modal}
          kategoriList={kategori}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchBarang(); }}
        />
      )}

      <div className="page-header">
        <div className="page-title">Inventaris Barang</div>
        <div className="page-subtitle">Katalog dan manajemen barang organisasi</div>
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
              {kategori.map(k => <option key={k.IdKategori} value={k.IdKategori}>{k.NamaKategori}</option>)}
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
            <button id="btn-tambah-barang" className="btn btn-primary" onClick={() => setModal('create')}>
              + Tambah Barang
            </button>
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
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {barang.map((b, i) => {
                    const activePeminjaman = b.DetailPeminjaman?.[0]?.Peminjaman;
                    return (
                      <tr key={b.IdBarang}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-accent)' }}>{b.KodeInventaris}</td>
                        <td>{b.NamaBarang}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{b.Kategori?.NamaKategori ?? '-'}</td>
                        <td>
                          <span className={`badge badge-${b.Kondisi.toLowerCase().replace(' ', '')}`}>
                            {b.Kondisi === 'RusakRingan' ? 'Rusak Ringan' : b.Kondisi === 'RusakBerat' ? 'Rusak Berat' : b.Kondisi}
                          </span>
                        </td>
                        <td><span className={`badge badge-${b.Status.toLowerCase()}`}>{b.Status}</span></td>
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
                        <td>
                        <div className="action-btns">
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(b)}>Edit</button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(b)}
                            disabled={deleting === b.IdBarang}
                          >
                            {deleting === b.IdBarang ? '...' : 'Hapus'}
                          </button>
                        </div>
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
