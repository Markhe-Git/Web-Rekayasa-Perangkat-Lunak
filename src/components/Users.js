'use client';
import { useState, useEffect, useCallback } from 'react';

function UserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ Nim: '', Nama: '', Email: '', Password: '', Role: 'Anggota', ...user });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isEdit = !!user?.IdUser;
      const res = await fetch(isEdit ? `/api/users/${user.IdUser}` : '/api/users', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.Error ?? 'Terjadi kesalahan.'); return; }
      onSaved();
    } finally { setLoading(false); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{user?.IdUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠ {error}</div>}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">NIM / ID</label>
                <input id="input-nim" className="form-control" value={form.Nim} onChange={set('Nim')} required placeholder="210001" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select id="input-role" className="form-control" value={form.Role} onChange={set('Role')}>
                  <option value="Anggota">Anggota</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input id="input-nama" className="form-control" value={form.Nama} onChange={set('Nama')} required placeholder="Ahmad Rizal" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input id="input-email" className="form-control" type="email" value={form.Email} onChange={set('Email')} required placeholder="email@himtika.or.id" />
            </div>
            <div className="form-group">
              <label className="form-label">{user?.IdUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</label>
              <input id="input-password" className="form-control" type="password" value={form.Password} onChange={set('Password')} {...(!user?.IdUser ? { required: true } : {})} placeholder="••••••••" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button id="btn-submit-user" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (user) => {
    if (!confirm(`Hapus pengguna "${user.Nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(user.IdUser);
    const res = await fetch(`/api/users/${user.IdUser}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.Error ?? 'Gagal menghapus.'); }
    else fetchUsers();
    setDeleting(null);
  };

  return (
    <div className="page-content">
      {modal !== null && (
        <UserModal
          user={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchUsers(); }}
        />
      )}

      <div className="page-header">
        <div className="page-title">Pengguna</div>
        <div className="page-subtitle">Kelola akun anggota dan admin HIMTIKA</div>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                id="search-users"
                className="search-input"
                placeholder="Cari nama, NIM, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="toolbar-right">
            <button id="btn-tambah-user" className="btn btn-primary" onClick={() => setModal('create')}>
              + Tambah Pengguna
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading"><div className="spinner"></div> Memuat...</div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">Tidak ada pengguna ditemukan</div>
                <div className="empty-state-sub">Coba ubah kata kunci pencarian</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>#</th><th>NIM</th><th>Nama</th><th>Email</th><th>Role</th><th>Terdaftar</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.IdUser}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                      <td>{u.Nim}</td>
                      <td>{u.Nama}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.Email}</td>
                      <td><span className={`badge badge-${u.Role.toLowerCase()}`}>{u.Role}</span></td>
                      <td style={{ fontSize: 13 }}>{new Date(u.CreatedAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(u)}>Edit</button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(u)}
                            disabled={deleting === u.IdUser}
                          >
                            {deleting === u.IdUser ? '...' : 'Hapus'}
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
