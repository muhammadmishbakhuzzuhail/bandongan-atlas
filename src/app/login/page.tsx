'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetchApi('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Autentikasi gagal. Silakan periksa kembali kredensial Anda.');
      }
    } catch {
      setError('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative subtle map-like background pattern or noise could go here. For now, a clean canvas. */}

      <div className="sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#173B39]/5 mb-5">
            <Image
              src="/branding/logo-kabupaten-magelang.webp"
              alt="Logo Kabupaten Magelang"
              width={64}
              height={82}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-center text-[1.4rem] font-bold tracking-[-0.03em] leading-tight text-[#173B39]">
            Kecamatan Bandongan <br />Kabupaten Magelang
          </h2>
        </div>

        {/* Login Card */}
        <div className="bg-white py-10 px-8 shadow-[0_24px_64px_rgba(23,59,57,0.08),0_6px_16px_rgba(23,59,57,0.03)] rounded-[20px] border border-[#173B39]/[0.06]">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-[#a8453f]/5 border border-[#a8453f]/20 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-[#a8453f] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-medium text-[#a8453f] leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#173B39] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="appearance-none block w-full px-4 py-3 bg-[#F5F8F6] border border-[#173B39]/10 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] sm:text-sm text-[#173B39] font-medium transition-colors placeholder:text-[#173B39]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#173B39] uppercase tracking-wider mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="appearance-none block w-full px-4 py-3 bg-[#F5F8F6] border border-[#173B39]/10 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] sm:text-sm text-[#173B39] font-medium transition-colors placeholder:text-[#173B39]/40"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#1E716A] hover:bg-[#155A55] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E716A] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(30,113,106,0.25)] hover:shadow-[0_6px_16px_rgba(30,113,106,0.35)]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dasbor</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#173B39]/5">
            <p className="text-center text-xs text-[#173B39]/50">
              Hanya untuk penggunaan internal.<br />Akses tidak sah dilarang.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[0.65rem] font-medium text-[#173B39]/40">
          Atlas Monografi &copy; {new Date().getFullYear()} Pemerintah Kecamatan Bandongan
        </p>
      </div>
    </div>
  );
}
