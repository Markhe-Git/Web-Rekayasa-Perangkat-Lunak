Kondisi Tes Gagal:

- Penyebab: Ada ketidaksesuaian logika atau respon (misal status 400 tapi diharapkan 999).
- Proses: Vitest menghasilkan error (exit code 1), sehingga perintah 'next build' langsung diblokir dan tidak dijalankan.
- Hasil: Server produksi terlindungi, kode cacat tidak naik ke internet.

Kondisi Tes Berhasil:

- Penyebab: Kode program dan seluruh 200 skenario pengujian cocok tanpa ada error.
- Proses: Vitest selesai dengan sukses (exit code 0), mengizinkan perintah 'next build' berjalan dan memicu auto-deploy.
- Hasil: Aplikasi versi baru sukses tayang (live) di Vercel dengan jaminan bebas bug regresi.