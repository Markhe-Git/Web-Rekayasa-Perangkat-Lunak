'use client';
import { useState, useEffect, useCallback } from 'react';

const STATUS_LABEL = { Pending: 'Menunggu', Approved: 'Disetujui', Rejected: 'Ditolak', Completed: 'Selesai', Cancelled: 'Dibatalkan' };

function PeminjamanFormModal({ users, barangList, onClose, onSaved }) {
  const [form, setForm] = useState({ IdUser: '', TglPinjam: '', TglRencanaKembali: '', TujuanPinjam: '', Items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleBarang = (id) => {
    setForm(f => ({
      ...f,
      Items: f.Items.includes(id) ? f.Items.filter(i => i !== id) : [...f.Items, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.Items.length) { setError('Pilih minimal 1 barang.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.Error ?? 'Terjadi kesalahan.'); return; }
      onSaved();
    } finally { setLoading(false); }
  };

  const availableBarang = barangList.filter(b => b.Status === 'Tersedia');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Ajukan Peminjaman</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠ {error}</div>}
            <div className="form-group">
              <label className="form-label">Peminjam</label>
              <select id="input-peminjam" className="form-control" value={form.IdUser} onChange={set('IdUser')} required>
                <option value="">-- Pilih Peminjam --</option>
                {users.filter(u => u.Role === 'Anggota').map(u => (
                  <option key={u.IdUser} value={u.IdUser}>{u.Nama} ({u.Nim})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tujuan Peminjaman</label>
              <textarea id="input-tujuan" className="form-control" value={form.TujuanPinjam} onChange={set('TujuanPinjam')} required placeholder="Sebutkan tujuan peminjaman..." />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Tanggal Pinjam</label>
                <input id="input-tgl-pinjam" className="form-control" type="datetime-local" value={form.TglPinjam} onChange={set('TglPinjam')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Rencana Kembali</label>
                <input id="input-tgl-kembali" className="form-control" type="datetime-local" value={form.TglRencanaKembali} onChange={set('TglRencanaKembali')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Pilih Barang ({form.Items.length} dipilih)</label>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', maxHeight: 220, overflowY: 'auto', padding: 4 }}>
                {availableBarang.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Tidak ada barang tersedia</div>
                ) : availableBarang.map(b => (
                  <label
                    key={b.IdBarang}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'var(--transition)', background: form.Items.includes(b.IdBarang) ? 'var(--accent-light)' : 'transparent' }}
                  >
                    <input
                      type="checkbox"
                      id={`barang-${b.IdBarang}`}
                      checked={form.Items.includes(b.IdBarang)}
                      onChange={() => toggleBarang(b.IdBarang)}
                      style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{b.NamaBarang}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.KodeInventaris} · {b.Kategori?.NamaKategori}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button id="btn-submit-peminjaman" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Memproses...' : 'Ajukan Peminjaman'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ peminjaman, users, onClose, onAction }) {
  const [loading, setLoading] = useState(false);
  const [catatanAdmin, setCatatanAdmin] = useState(peminjaman.CatatanAdmin ?? '');
  const [catatanKembali, setCatatanKembali] = useState({});
  const adminId = users.find(u => u.Role === 'Admin')?.IdUser ?? 1;

  const handleAction = async (action) => {
    setLoading(true);
    const body = { Action: action, IdAdminApproval: adminId, CatatanAdmin: catatanAdmin };
    if (action === 'Complete') body.CatatanKondisiKembali = catatanKembali;
    const res = await fetch(`/api/peminjaman/${peminjaman.IdPeminjaman}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { alert(data.Error ?? 'Terjadi kesalahan.'); return; }
    onAction();
  };

  const p = peminjaman;
  const isPending = p.StatusPeminjaman === 'Pending';
  const isApproved = p.StatusPeminjaman === 'Approved';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Detail Peminjaman #{p.IdPeminjaman}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className={`badge badge-${p.StatusPeminjaman.toLowerCase()}`}>{STATUS_LABEL[p.StatusPeminjaman]}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Diajukan {new Date(p.TglPengajuan).toLocaleString('id-ID')}</span>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Peminjam</div>
              <div className="detail-value">{p.User?.Nama} ({p.User?.Nim})</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Diproses Oleh</div>
              <div className="detail-value">{p.Admin?.Nama ?? '-'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Tanggal Pinjam</div>
              <div className="detail-value">{new Date(p.TglPinjam).toLocaleString('id-ID')}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Rencana Kembali</div>
              <div className="detail-value">{new Date(p.TglRencanaKembali).toLocaleString('id-ID')}</div>
            </div>
            {p.TglRealisasiKembali && (
              <div className="detail-item">
                <div className="detail-label">Realisasi Kembali</div>
                <div className="detail-value">{new Date(p.TglRealisasiKembali).toLocaleString('id-ID')}</div>
              </div>
            )}
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-label">Tujuan Peminjaman</div>
              <div className="detail-value">{p.TujuanPinjam}</div>
            </div>
          </div>

          <div>
            <div className="detail-label" style={{ marginBottom: 8 }}>Barang yang Dipinjam</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {p.DetailPeminjaman?.map(d => (
                <div key={d.IdDetail} style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{d.Barang?.NamaBarang}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{d.Barang?.KodeInventaris}</div>
                  {isApproved && (
                    <input
                      className="form-control"
                      style={{ marginTop: 8, fontSize: 13 }}
                      placeholder="Catatan kondisi saat kembali..."
                      value={catatanKembali[d.IdDetail] ?? ''}
                      onChange={e => setCatatanKembali(c => ({ ...c, [d.IdDetail]: e.target.value }))}
                    />
                  )}
                  {d.CatatanKondisiKembali && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📝 {d.CatatanKondisiKembali}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {(isPending || isApproved) && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Catatan Admin</label>
              <textarea
                id="input-catatan-admin"
                className="form-control"
                value={catatanAdmin}
                onChange={e => setCatatanAdmin(e.target.value)}
                placeholder="Tambahkan catatan untuk peminjam..."
              />
            </div>
          )}

          {p.CatatanAdmin && !isPending && !isApproved && (
            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div className="detail-label" style={{ marginBottom: 4 }}>Catatan Admin</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p.CatatanAdmin}</div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Tutup</button>
          {isPending && (
            <>
              <button id="btn-tolak" className="btn btn-danger" onClick={() => handleAction('Reject')} disabled={loading}>
                {loading ? '...' : '✕ Tolak'}
              </button>
              <button id="btn-setujui" className="btn btn-success" onClick={() => handleAction('Approve')} disabled={loading}>
                {loading ? '...' : '✓ Setujui'}
              </button>
            </>
          )}
          {isApproved && (
            <button id="btn-selesai" className="btn btn-primary" onClick={() => handleAction('Complete')} disabled={loading}>
              {loading ? '...' : '✓ Konfirmasi Pengembalian'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Peminjaman() {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetchPeminjaman = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/peminjaman?${params}`);
    const data = await res.json();
    setList(data);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers);
    fetch('/api/barang').then(r => r.json()).then(setBarang);
  }, []);

  useEffect(() => { fetchPeminjaman(); }, [fetchPeminjaman]);

  const handleCancel = async (p) => {
    if (!confirm('Batalkan pengajuan peminjaman ini?')) return;
    const res = await fetch(`/api/peminjaman/${p.IdPeminjaman}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Action: 'Cancel' }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.Error ?? 'Gagal membatalkan.');
    else fetchPeminjaman();
  };

  return (
    <div className="page-content">
      {modal && (
        <PeminjamanFormModal
          users={users}
          barangList={barang}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchPeminjaman(); fetch('/api/barang').then(r => r.json()).then(setBarang); }}
        />
      )}
      {detail && (
        <DetailModal
          peminjaman={detail}
          users={users}
          onClose={() => setDetail(null)}
          onAction={() => { setDetail(null); fetchPeminjaman(); fetch('/api/barang').then(r => r.json()).then(setBarang); }}
        />
      )}

      <div className="page-header">
        <div className="page-title">Peminjaman</div>
        <div className="page-subtitle">Kelola pengajuan dan persetujuan peminjaman barang</div>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="tabs" style={{ marginBottom: 0 }}>
              {['', 'Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'].map(s => (
                <button
                  key={s}
                  id={`tab-${s || 'semua'}`}
                  className={`tab${filterStatus === s ? ' active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === '' ? 'Semua' : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-right">
            <button id="btn-ajukan-peminjaman" className="btn btn-primary" onClick={() => setModal(true)}>
              + Ajukan Peminjaman
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading"><div className="spinner"></div> Memuat...</div>
            ) : list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">Tidak ada data peminjaman</div>
                <div className="empty-state-sub">Belum ada pengajuan dengan filter ini</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>#</th><th>Peminjam</th><th>Tujuan</th><th>Tgl Pinjam</th><th>Rencana Kembali</th><th>Barang</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {list.map((p, i) => (
                    <tr key={p.IdPeminjaman}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.User?.Nama}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.User?.Nim}</div>
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.TujuanPinjam}
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(p.TglPinjam).toLocaleDateString('id-ID')}</td>
                      <td style={{ fontSize: 13 }}>{new Date(p.TglRencanaKembali).toLocaleDateString('id-ID')}</td>
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {p.DetailPeminjaman?.length ?? 0} unit
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${p.StatusPeminjaman.toLowerCase()}`}>
                          {STATUS_LABEL[p.StatusPeminjaman]}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-secondary btn-sm" onClick={() => setDetail(p)}>Detail</button>
                          {p.StatusPeminjaman === 'Pending' && (
                            <button className="btn btn-warning btn-sm" onClick={() => handleCancel(p)}>Batal</button>
                          )}
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
