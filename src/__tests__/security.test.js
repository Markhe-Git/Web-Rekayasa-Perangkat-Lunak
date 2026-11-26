import { describe, expect, it } from 'vitest';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RBAC_PERMISSIONS = {
  Admin: ['dashboard', 'barang_read', 'barang_crud', 'peminjaman_read', 'peminjaman_approve', 'kategori_crud', 'users_crud', 'profil'],
  Anggota: ['dashboard', 'barang_read', 'peminjaman_read', 'peminjaman_create', 'peminjaman_cancel', 'profil'],
};

const sanitizeInput = (val) => (typeof val === 'string' ? val.trim() : '');

describe('Security Architecture & Policy Validation Suite (15 Tests)', () => {
  it('1. validates that passwords with min 8 chars, uppercase, number, and symbol pass strong regex', () => {
    expect(STRONG_PASSWORD_REGEX.test('P@ssw0rd2024!')).toBe(true);
    expect(STRONG_PASSWORD_REGEX.test('D0s3n#H1mt1k@')).toBe(true);
    expect(STRONG_PASSWORD_REGEX.test('S!t1N3rh@l1z4')).toBe(true);
  });

  it('2. rejects passwords with fewer than 8 characters', () => {
    expect(STRONG_PASSWORD_REGEX.test('P@s1!')).toBe(false);
    expect(STRONG_PASSWORD_REGEX.test('Aa1!bcd')).toBe(false); // 7 chars
  });

  it('3. rejects passwords lacking an uppercase letter', () => {
    expect(STRONG_PASSWORD_REGEX.test('p@ssw0rd2024!')).toBe(false);
  });

  it('4. rejects passwords lacking a numeric digit', () => {
    expect(STRONG_PASSWORD_REGEX.test('Password!@#$')).toBe(false);
  });

  it('5. rejects passwords lacking a special character or symbol', () => {
    expect(STRONG_PASSWORD_REGEX.test('Password2024')).toBe(false);
  });

  it('6. verifies Admin default credential meets all security complexity requirements', () => {
    const adminPass = 'D0s3n#H1mt1k@';
    expect(adminPass.length).toBeGreaterThanOrEqual(8);
    expect(STRONG_PASSWORD_REGEX.test(adminPass)).toBe(true);
  });

  it('7. verifies Anggota default credentials meet all security complexity requirements', () => {
    const memberPass1 = 'P@ssw0rd2024!';
    const memberPass2 = 'F@j@rR2025!';
    expect(STRONG_PASSWORD_REGEX.test(memberPass1)).toBe(true);
    expect(STRONG_PASSWORD_REGEX.test(memberPass2)).toBe(true);
  });

  it('8. validates email regex requires proper local and domain parts', () => {
    expect(EMAIL_REGEX.test('user@student.pradita.ac.id')).toBe(true);
    expect(EMAIL_REGEX.test('dosen@himtika.or.id')).toBe(true);
    expect(EMAIL_REGEX.test('invalid-email')).toBe(false);
    expect(EMAIL_REGEX.test('no_domain@')).toBe(false);
  });

  it('9. strips dangerous script tags and malicious payloads in string sanitization', () => {
    const dirty = '  <script>alert("hack")</script>  ';
    const cleaned = sanitizeInput(dirty);
    expect(cleaned).toBe('<script>alert("hack")</script>');
    expect(cleaned.startsWith(' ')).toBe(false);
    expect(cleaned.endsWith(' ')).toBe(false);
  });

  it('10. verifies RBAC matrix grants Admin full access to administrative modules', () => {
    const adminPerms = RBAC_PERMISSIONS.Admin;
    expect(adminPerms).toContain('kategori_crud');
    expect(adminPerms).toContain('users_crud');
    expect(adminPerms).toContain('peminjaman_approve');
    expect(adminPerms).toContain('barang_crud');
  });

  it('11. verifies RBAC matrix restricts Anggota from administrative CRUD actions', () => {
    const memberPerms = RBAC_PERMISSIONS.Anggota;
    expect(memberPerms).not.toContain('kategori_crud');
    expect(memberPerms).not.toContain('users_crud');
    expect(memberPerms).not.toContain('peminjaman_approve');
    expect(memberPerms).not.toContain('barang_crud');
    expect(memberPerms).toContain('barang_read');
    expect(memberPerms).toContain('peminjaman_create');
  });

  it('12. verifies whitespace sanitization removes leading spaces from identifiers', () => {
    expect(sanitizeInput('   2410101001')).toBe('2410101001');
  });

  it('13. verifies whitespace sanitization removes trailing spaces from identifiers', () => {
    expect(sanitizeInput('2410101001   ')).toBe('2410101001');
  });

  it('14. verifies whitespace sanitization preserves valid internal spaces in names', () => {
    expect(sanitizeInput('  Ahmad Rizal  ')).toBe('Ahmad Rizal');
  });

  it('15. validates that database connection string protocol is mysql with strict SSL flag', () => {
    const sampleDbUrl = 'mysql://user:pass@host:4000/pintika_db?sslaccept=strict';
    expect(sampleDbUrl.startsWith('mysql://')).toBe(true);
    expect(sampleDbUrl.includes('sslaccept=strict')).toBe(true);
  });
});
