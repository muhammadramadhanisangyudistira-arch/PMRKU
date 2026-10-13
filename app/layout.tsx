import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: "Ayo PMRku - Sistem Informasi & Buku Induk Digital PMR",
  description: "Sistem Manajemen & Buku Induk Digital Ekstrakurikuler Palang Merah Remaja (PMR Mula, Madya, Wira) lengkap dengan KTA Digital, Presensi Selfie, Modul PMI, dan Uji SKK.",
  openGraph: {
    title: "Ayo PMRku - Sistem Informasi & Buku Induk Digital PMR",
    description: "Sistem Manajemen & Buku Induk Digital Ekstrakurikuler Palang Merah Remaja (PMR Mula, Madya, Wira)",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayo PMRku - Sistem Informasi & Buku Induk Digital PMR",
    description: "Sistem Manajemen & Buku Induk Digital Ekstrakurikuler Palang Merah Remaja",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
