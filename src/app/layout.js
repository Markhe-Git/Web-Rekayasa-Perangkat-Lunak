import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Pintika | Sistem Peminjaman Barang HIMTIKA',
  description: 'Alat pencatatan dan pengelolaan izin peminjaman barang organisasi HIMTIKA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
