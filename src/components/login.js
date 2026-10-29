'use client';
import { useState } from 'react';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!identifier || !password) {
            setError('Mohon masukkan NIM/Email dan Password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.Error || 'Login gagal. Periksa kembali data Anda.');
                return;
            }

            if (onLoginSuccess && data.user) {
                onLoginSuccess(data.user);
            }
        } catch (err) {
            setError('Terjadi gangguan jaringan atau server tidak merespon.');
        } finally {
            setLoading(false);
        }
    };

    const setDemoAccount = (demoId, demoPass) => {
        setIdentifier(demoId);
        setPassword(demoPass);
        setError('');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Brand Header */}
                <div className="login-header">
                    <div className="login-brand-icon">📌</div>
                    <h1 className="login-brand-title">Pintika</h1>
                    <p className="login-brand-subtitle">Sistem Peminjaman & Inventaris HIMTIKA</p>
                </div>

                {/* Access Role Notice */}
                <div className="login-roles-badge-container">
                    <span className="role-pill pill-admin">🛡️ Admin: Akses Penuh</span>
                    <span className="role-pill pill-member">👤 Anggota: Akses Terbatas</span>
                </div>

                {/* Form Error Alert */}
                {error && (
                    <div className="alert alert-error login-alert" role="alert">
                        <span className="alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-identifier">
                            NIM atau Email
                        </label>
                        <div className="input-with-icon">
                            <span className="input-icon">👤</span>
                            <input
                                id="login-identifier"
                                type="text"
                                className="form-control login-input"
                                placeholder="Contoh: 2110101001 atau jane.doe@student.pradita.ac.id"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                autoComplete="username"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">
                            Password
                        </label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-control login-input"
                                placeholder="Masukkan password Anda"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
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

                    <button
                        id="btn-login"
                        type="submit"
                        className="btn btn-primary login-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner login-spinner"></span>
                                <span>Memverifikasi...</span>
                            </>
                        ) : (
                            'Masuk ke Sistem'
                        )}
                    </button>

                    {onSwitchToRegister && (
                        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                            Belum punya akun?{' '}
                            <button
                                id="btn-switch-register"
                                type="button"
                                onClick={onSwitchToRegister}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                }}
                            >
                                Daftar Akun Baru
                            </button>
                        </div>
                    )}
                </form>

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
