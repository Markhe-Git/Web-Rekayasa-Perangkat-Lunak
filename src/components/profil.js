'use client';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

export default function Profil({ currentUser, onUpdateUser, onLogout }) {
  const [profile, setProfile] = useState({
    Nim: '',
    Nama: '',
    Email: '',
    Password: '',
  });

  const [initialData, setInitialData] = useState({
    Nim: '',
    Nama: '',
    Email: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [changesList, setChangesList] = useState([]);

  // Fetch or sync initial profile
  useEffect(() => {
    if (currentUser) {
      const data = {
        Nim: currentUser.Nim || '',
        Nama: currentUser.Nama || '',
        Email: currentUser.Email || '',
      };
      setProfile({
        ...data,
        Password: '',
      });
      setInitialData(data);
    }
  }, [currentUser]);

  // Handle input changes
  const handleChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
    setSuccess('');
  };

  // Detect which attributes changed
  const getChangedAttributes = () => {
    const changes = [];

    if (profile.Nama.trim() !== initialData.Nama.trim()) {
      changes.push({
        label: 'Nama Lengkap',
        oldVal: initialData.Nama,
        newVal: profile.Nama.trim(),
      });
    }

    if (profile.Nim.trim() !== initialData.Nim.trim()) {
      changes.push({
        label: 'NIM',
        oldVal: initialData.Nim,
        newVal: profile.Nim.trim(),
      });
    }

    if (profile.Email.trim() !== initialData.Email.trim()) {
      changes.push({
        label: 'Email',
        oldVal: initialData.Email,
        newVal: profile.Email.trim(),
      });
    }

    if (profile.Password && profile.Password.trim().length > 0) {
      changes.push({
        label: 'Password',
        oldVal: '••••••••',
        newVal: 'Password baru akan diterapkan',
      });
    }

    return changes;
  };

  // Submit button clicked: validate and trigger confirmation modal if changes exist
  const handlePreSave = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi
    if (!profile.Nim.trim()) {
      setError('NIM wajib diisi.');
      return;
    }
    if (!profile.Nama.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!profile.Email.trim()) {
      setError('Email wajib diisi.');
      return;
    }

    const detectedChanges = getChangedAttributes();

    if (detectedChanges.length === 0) {
      setError('Tidak ada perubahan data profil yang perlu disimpan.');
      return;
    }

    setChangesList(detectedChanges);
    setShowSaveModal(true);
  };

  // Confirmed save profile
  const handleConfirmSave = async () => {
    if (!currentUser?.IdUser) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        Nim: profile.Nim.trim(),
        Nama: profile.Nama.trim(),
        Email: profile.Email.trim(),
        Role: currentUser.Role,
      };

      if (profile.Password && profile.Password.trim().length > 0) {
        payload.Password = profile.Password.trim();
      }

      const res = await fetch(`/api/users/${currentUser.IdUser}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.Error ?? 'Gagal memperbarui profil.');
        setShowSaveModal(false);
        return;
      }

      // Update state and parent/local storage session
      const updatedUser = {
        ...currentUser,
        Nim: data.Nim || payload.Nim,
        Nama: data.Nama || payload.Nama,
        Email: data.Email || payload.Email,
      };

      setInitialData({
        Nim: updatedUser.Nim,
        Nama: updatedUser.Nama,
        Email: updatedUser.Email,
      });

      setProfile((prev) => ({
        ...prev,
        Password: '',
      }));

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setSuccess('Profil berhasil diperbarui!');
      setShowSaveModal(false);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi saat memperbarui profil.');
      setShowSaveModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Confirmed delete account
  const handleConfirmDelete = async () => {
    if (!currentUser?.IdUser) return;
    setDeleteLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${currentUser.IdUser}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.Error ?? 'Gagal menghapus akun.');
        setShowDeleteModal(false);
        return;
      }

      setShowDeleteModal(false);
      // Log out user upon successful deletion
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi saat menghapus akun.');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const userInitial = profile.Nama ? profile.Nama.charAt(0).toUpperCase() : 'U';

  return (
    <div className="page-content">
      {/* Header Halaman */}
      <div className="page-header">
        <h1 className="page-title">Profil Pengguna</h1>
        <p className="page-subtitle">
          Kelola informasi identitas akun, kredensial, dan keamanan profil Anda
        </p>
      </div>

      <div className="page-body" style={{ maxWidth: 800 }}>
        {/* User Badge / Card Profile Banner */}
        <div
          className="card"
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(249, 161, 33, 0.08) 0%, rgba(242, 110, 33, 0.04) 100%)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="card-body"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '24px 28px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--brand-orange))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 4px 14px rgba(242, 110, 33, 0.3)',
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {profile.Nama || 'Pengguna'}
                </h2>
                <span className={`badge ${currentUser?.Role === 'Admin' ? 'badge-admin' : 'badge-anggota'}`}>
                  {currentUser?.Role === 'Admin' ? '👑 Administrator' : '🎓 Anggota'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>🆔 NIM: <strong style={{ color: 'var(--text-secondary)' }}>{profile.Nim || '-'}</strong></span>
                <span>✉️ Email: <strong style={{ color: 'var(--text-secondary)' }}>{profile.Email || '-'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifikasi Alerts */}
        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 20 }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert" style={{ marginBottom: 20 }}>
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Form Edit Profil */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Edit Data Profil</h3>
          </div>

          <div className="card-body">
            <form onSubmit={handlePreSave} id="form-edit-profil">
              <div className="form-grid-2">
                {/* NIM */}
                <div className="form-group">
                  <label htmlFor="input-profil-nim" className="form-label">
                    Nomor Induk Mahasiswa (NIM) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="input-profil-nim"
                    type="text"
                    className="form-control"
                    value={profile.Nim}
                    onChange={handleChange('Nim')}
                    placeholder="Contoh: 210001"
                    required
                  />
                </div>

                {/* Nama Lengkap */}
                <div className="form-group">
                  <label htmlFor="input-profil-nama" className="form-label">
                    Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="input-profil-nama"
                    type="text"
                    className="form-control"
                    value={profile.Nama}
                    onChange={handleChange('Nama')}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="input-profil-email" className="form-label">
                  Alamat Email <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="input-profil-email"
                  type="email"
                  className="form-control"
                  value={profile.Email}
                  onChange={handleChange('Email')}
                  placeholder="email@himtika.or.id"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label htmlFor="input-profil-password" className="form-label" style={{ marginBottom: 0 }}>
                    Password Baru
                  </label>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    (Kosongkan jika tidak ingin mengubah password)
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="input-profil-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={profile.Password}
                    onChange={handleChange('Password')}
                    placeholder="Masukkan password baru..."
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: 2,
                    }}
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Delete Account di Kiri, Save di Kanan */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 32,
                  paddingTop: 20,
                  borderTop: '1px solid var(--border)',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                {/* Tombol Delete Account di Sebelah Kiri */}
                <button
                  id="btn-delete-account"
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading || deleteLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>🗑️</span>
                  <span>Delete Account</span>
                </button>

                {/* Tombol Save di Sebelah Kanan */}
                <button
                  id="btn-save-profile"
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || deleteLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 140,
                    justifyContent: 'center',
                  }}
                >
                  <span>💾</span>
                  <span>{loading ? 'Menyimpan...' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Perubahan Data (Nama, NIM, Email, Password) */}
      <ConfirmModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Perubahan Profil"
        message="Terjadi perubahan pada data akun Anda. Apakah Anda yakin ingin menyimpan perubahan berikut?"
        confirmText="Ya, Simpan Perubahan"
        confirmVariant="primary"
        icon="📝"
        loading={loading}
        details={
          changesList.length > 0 ? (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, fontSize: 13 }}>
                Rincian atribut yang diubah:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {changesList.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '8px 10px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                      {item.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {item.oldVal}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>➔</span>
                      <strong style={{ color: 'var(--success)' }}>
                        {item.newVal}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        }
      />

      {/* Modal Konfirmasi Hapus Akun (Delete Account) */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Akun"
        message={`Apakah Anda yakin ingin menghapus akun "${profile.Nama}" secara permanen?`}
        confirmText="Ya, Hapus Akun Saya"
        confirmVariant="danger"
        icon="⚠️"
        loading={deleteLoading}
        details={
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 6 }}>
              ⛔ Tindakan ini tidak dapat dibatalkan!
            </p>
            <p>
              Seluruh data login dan akses Anda ke sistem Pintika akan dihapus. Jika Anda masih memiliki peminjaman barang aktif, penghapusan akan dibatalkan.
            </p>
          </div>
        }
      />
    </div>
  );
}
