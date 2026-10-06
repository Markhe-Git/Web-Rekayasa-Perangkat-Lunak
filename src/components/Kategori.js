'use client';
import { useState, useEffect, useCallback } from 'react';

function KategoriModal({ kategori, onClose, onSaved }) {
  const [nama, setNama] = useState(kategori?.NamaKategori ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isEdit = !!kategori?.IdKategori;
      const res = await fetch(isEdit ? `/api/kategori/${kategori.IdKategori}` : '/api/kategori', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NamaKategori: nama }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.Error ?? 'Terjadi kesalahan.'); return; }
      onSaved();
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{kategori?.IdKategori ? 'Edit Kategori' : 'Tambah Kategori'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠ {error}</div>}
            <div className="form-group">
              <label className="form-label">Nama Kategori</label>
              <input
                id="input-nama-kategori"
                className="form-control"
                value={nama}
                onChange={e => setNama(e.target.value)}
                required
                placeholder="Elektronik & Multimedia"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button id="btn-submit-kategori" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Kategori() {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchKategori = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/kategori');
    const data = await res.json();
    setKategori(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchKategori(); }, [fetchKategori]);

  const handleDelete = async (k) => {
    if (!confirm(`Hapus kategori "${k.NamaKategori}"?`)) return;
    setDeleting(k.IdKategori);
    const res = await fetch(`/api/kategori/${k.IdKategori}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.Error ?? 'Gagal menghapus.'); }
    else fetchKategori();
    setDeleting(null);
  };

  return (
    <div className="page-content">
      {modal !== null && (
        <KategoriModal
          kategori={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchKategori(); }}
        />
      )}

      <div className="page-header">
        <div className="page-title">Kategori Barang</div>
        <div className="page-subtitle">Kelola kategori untuk klasifikasi inventaris</div>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left"></div>
          <div className="toolbar-right">
            <button id="btn-tambah-kategori" className="btn btn-primary" onClick={() => setModal('create')}>
              + Tambah Kategori
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading"><div className="spinner"></div> Memuat...</div>
            ) : kategori.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏷️</div>
                <div className="empty-state-text">Belum ada kategori</div>
                <button className="btn btn-primary" onClick={() => setModal('create')}>Tambah Kategori</button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>#</th><th>Nama Kategori</th><th>Jumlah Barang</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {kategori.map((k, i) => (
                    <tr key={k.IdKategori}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                      <td>{k.NamaKategori}</td>
                      <td>
                        <span className="badge badge-approved">{k._count?.Barang ?? 0} barang</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(k)}>Edit</button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(k)}
                            disabled={deleting === k.IdKategori}
                          >
                            {deleting === k.IdKategori ? '...' : 'Hapus'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
