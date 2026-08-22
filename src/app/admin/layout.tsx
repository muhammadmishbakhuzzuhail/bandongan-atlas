'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { fetchApi } from '@/lib/api-client';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LogOut,
  MapPin,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin/monografi', label: 'Data Monografi', icon: BarChart3 },
  { href: '/admin/indikator', label: 'Master Indikator', icon: BookOpen },
  { href: '/admin/desa', label: 'Master Desa', icon: MapPin },
  { href: '/admin/audit', label: 'Log Aktivitas', icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetchApi('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-semibold transition-all ${
              isActive
                ? 'bg-[#1E716A] text-white shadow-md shadow-[#1E716A]/20'
                : 'text-[#173B39]/60 hover:bg-[#F9FAFB] hover:text-[#173B39]'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="h-screen bg-[#F9FAFB] flex overflow-hidden">
      {/* ───── Desktop Sidebar ───── */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 bg-white border-r border-[#173B39]/10 h-full">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#173B39]/5">
          <Image
            src="/branding/logo-kabupaten-magelang.webp"
            alt="Logo Kabupaten Magelang"
            width={38}
            height={48}
            priority
            className="shrink-0 w-auto h-[48px]"
          />
          <div className="min-w-0">
            <p className="text-[#173B39] text-[0.95rem] font-bold tracking-tight truncate">
              Kec. Bandongan
            </p>
            <p className="text-[#1E716A] text-xs font-semibold uppercase tracking-wider truncate mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-3 pt-4">
          <NavLinks />
        </nav>

        {/* Actions */}
        <div className="p-4 border-t border-[#173B39]/5 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-semibold text-[#1E716A] bg-[#1E716A]/5 border border-[#1E716A]/10 hover:bg-[#1E716A]/10 transition-colors w-full"
          >
            <ExternalLink size={18} strokeWidth={2} />
            Lihat Peta
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-semibold text-[#a8453f] hover:bg-[#a8453f]/5 transition-colors w-full"
          >
            <LogOut size={18} strokeWidth={2} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ───── Mobile Sidebar Overlay ───── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-white border-r border-[#173B39]/10 flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#173B39]/5">
          <div className="flex items-center gap-3">
            <Image
              src="/branding/logo-kabupaten-magelang.webp"
              alt="Logo Kabupaten Magelang"
              width={30}
              height={40}
              className="w-auto h-[40px]"
            />
            <p className="text-[#173B39] text-[0.95rem] font-bold">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#173B39]/50 hover:text-[#173B39] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Tutup menu"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-1.5 p-4 pt-5">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-[#173B39]/5 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-semibold text-[#1E716A] bg-[#1E716A]/5 border border-[#1E716A]/10 hover:bg-[#1E716A]/10 transition-colors w-full"
          >
            <ExternalLink size={18} strokeWidth={2} />
            Lihat Peta
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-semibold text-[#a8453f] hover:bg-[#a8453f]/5 transition-colors w-full"
          >
            <LogOut size={18} strokeWidth={2} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white/95 backdrop-blur-md border-b border-[#173B39]/10 shrink-0 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#173B39] hover:bg-gray-100 active:bg-gray-200 p-2 rounded-xl transition-colors"
              aria-label="Buka menu"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
            <Image
              src="/branding/logo-kabupaten-magelang.webp"
              alt="Logo"
              width={26}
              height={34}
              className="w-auto h-[34px]"
            />
          </div>
          <span className="text-[#173B39] text-[0.95rem] font-bold tracking-tight">Admin Panel</span>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto relative w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
