'use client';
import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

function AddUserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ Nim: '', Nama: '', Email: '', Password: '', Role: 'Anggota' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.Error ?? 'Terjadi kesalahan saat menambahkan pengguna.'); return; }
      onSaved();
    } finally { setLoading(false); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Tambah Pengguna Baru</div>
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
              <label className="form-label">Password</label>
              <input id="input-password" className="form-control" type="password" value={form.Password} onChange={set('Password')} required placeholder="••••••••" />
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

function EditRoleModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user?.Role || 'Anggota');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === user.Role) {
      onClose();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${user.IdUser}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Nim: user.Nim,
          Nama: user.Nama,
          Email: user.Email,
          Role: role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.Error ?? 'Gagal mengubah role pengguna.');
        return;
      }
      onSaved();
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Ubah Role Pengguna</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠ {error}</div>}

            <div style={{
              background: 'var(--bg-primary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              marginBottom: 18,
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15, marginBottom: 4 }}>
                {user.Nama}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>NIM: <strong style={{ color: 'var(--text-secondary)' }}>{user.Nim}</strong></span>
                <span>Email: <strong style={{ color: 'var(--text-secondary)' }}>{user.Email}</strong></span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="select-role" className="form-label">
                Pilih Role <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="select-role"
                className="form-control"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="Anggota">Anggota</option>
                <option value="Admin">Admin</option>
              </select>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                💡 Admin hanya berwenang mengubah Role/hak akses. Data akun lainnya (NIM, Nama, Email, Password) dikelola secara mandiri oleh pengguna.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Batal
            </button>
            <button id="btn-save-role" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Role'}
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.IdUser);
    try {
      const res = await fetch(`/api/users/${confirmDelete.IdUser}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { alert(data.Error ?? 'Gagal menghapus.'); }
      else { setConfirmDelete(null); fetchUsers(); }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page-content">
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchUsers(); }}
        />
      )}

      {editRoleUser && (
        <EditRoleModal
          user={editRoleUser}
          onClose={() => setEditRoleUser(null)}
          onSaved={() => { setEditRoleUser(null); fetchUsers(); }}
        />
      )}

      {/* Modal Konfirmasi Hapus Pengguna */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${confirmDelete?.Nama}"? Tindakan ini tidak dapat dibatalkan.`}
        details={confirmDelete ? (
          <div>
            <div><strong>NIM:</strong> {confirmDelete.Nim}</div>
            <div><strong>Email:</strong> {confirmDelete.Email}</div>
            <div><strong>Role:</strong> {confirmDelete.Role}</div>
          </div>
        ) : null}
        confirmText="Ya, Hapus"
        confirmVariant="danger"
        icon="🗑️"
        loading={deleting === confirmDelete?.IdUser}
      />

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
            <button id="btn-tambah-user" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
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
                      <td>
                        <button
                          type="button"
                          className={`badge badge-${u.Role.toLowerCase()}`}
                          onClick={() => setEditRoleUser(u)}
                          style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
                          title="Klik untuk mengubah role pengguna"
                        >
                          {u.Role} ✏️
                        </button>
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(u.CreatedAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            id={`btn-edit-role-${u.IdUser}`}
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditRoleUser(u)}
                            title="Ubah Role Pengguna"
                          >
                            Ubah Role
                          </button>
                          <button
                            id={`btn-delete-user-${u.IdUser}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirmDelete(u)}
                            disabled={deleting === u.IdUser}
                            title="Hapus Pengguna"
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
