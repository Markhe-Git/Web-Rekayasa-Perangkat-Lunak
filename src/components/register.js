'use client';
import { useState } from 'react';

export default function Register({ onSwitchToLogin, onRegisterSuccess }) {
    const [nim, setNim] = useState('');
    const [idUser, setIdUser] = useState('');
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // // Otomatis ekstrak 2 angka terakhir NIM untuk ID User (tidak bisa diedit manual)
    // const handleNimChange = (e) => {
    //     const val = e.target.value;
    //     setNim(val);

    //     const clean = val.trim();
    //     const match = clean.match(/(\d{2})$/);
    //     if (match) {
    //         setIdUser(match[1]);
    //     } else {
    //         setIdUser('');
    //     }
    //     setError('');
    // };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!nim || !nama || !email || !password) {
            setError('Mohon lengkapi semua field pendaftaran.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Nim: nim,
                    Nama: nama,
                    Email: email,
                    Password: password,
                    Role: 'Anggota', // Default Anggota
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.Error || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
                return;
            }

            setSuccess('Registrasi berhasil! Akun Anda telah terdaftar sebagai Anggota.');
            setTimeout(() => {
                if (onRegisterSuccess) {
                    onRegisterSuccess(data.user);
                } else if (onSwitchToLogin) {
                    onSwitchToLogin();
                }
            }, 1500);
        } catch (err) {
            setError('Terjadi gangguan jaringan atau server tidak merespon.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: 520 }}>
                {/* Brand Header */}
                <div className="login-header">
                    <div className="login-brand-icon">📝</div>
                    <h1 className="login-brand-title">Daftar Akun Baru</h1>
                    <p className="login-brand-subtitle">
                        Bergabung dengan Pintika HIMTIKA sebagai <strong>Anggota</strong>
                    </p>
                </div>

                {/* Role Default Badge */}
                <div className="login-roles-badge-container">
                    <span className="role-pill pill-member">
                        👤 Role: Anggota (Default)
                    </span>
                    <span className="role-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        ✓ Akses: Dashboard, Peminjaman & Inventaris
                    </span>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error" role="alert">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="alert alert-success" role="alert">
                        <span>🎉 {success}</span>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* NIM & Auto Locked IdUser Grid */}

                    <div className="form-group">
                        <label className="form-label" htmlFor="register-nim">
                            NIM <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <div className="input-with-icon">
                            <span className="input-icon">🎓</span>
                            <input
                                id="register-nim"
                                type="text"
                                className="form-control login-input"
                                placeholder="Contoh: 2110101002"
                                value={nim}
                                onChange={(e) => setNim(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>



                    {/* Nama Lengkap */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="register-nama">
                            Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <div className="input-with-icon">
                            <span className="input-icon">👤</span>
                            <input
                                id="register-nama"
                                type="text"
                                className="form-control login-input"
                                placeholder="Masukkan nama lengkap Anda"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="register-email">
                            Email <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <div className="input-with-icon">
                            <span className="input-icon">✉️</span>
                            <input
                                id="register-email"
                                type="email"
                                className="form-control login-input"
                                placeholder="Contoh: jane.doe@student.pradita.ac.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="register-password">
                            Password <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-control login-input"
                                placeholder="Buat password akun Anda"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    {/* Tombol Login sebelum Tombol Daftar */}
                    <div className="register-actions-container" style={{ display: 'flex', gap: 10, marginTop: 8 }}>

                        <button
                            id="btn-register"
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1, height: 44, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner login-spinner"></span>
                                    <span>Mendaftarkan...</span>
                                </>
                            ) : (
                                '✓ Daftar Akun'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer note */}
                <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
                    Sudah memiliki akun terdaftar?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Masuk di sini
                    </button>
                </div>

                {/* Roles & Permissions Explanation */}
                <div className="login-info-box">
                    <div className="info-box-title">📋 Ketentuan Hak Akses:</div>
                    <ul className="info-box-list">
                        <li>
                            <strong>Admin:</strong> Memiliki akses penuh ke Dashboard, Inventaris (tambah/edit/hapus), Persetujuan Peminjaman, Kategori, & Manajemen Pengguna.
                        </li>
                        <li>
                            <strong>Anggota:</strong> Akses Dashboard, Transaksi Peminjaman (tidak dapat menyetujui), dan Inventaris Barang (hanya melihat, tidak dapat menambah/mengubah).
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
