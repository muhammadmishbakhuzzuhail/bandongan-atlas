'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LogOut,
  MapPin,
  Menu,
  X,
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
    await fetch('/api/auth/logout', { method: 'POST' });
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#1E716A] text-white'
                : 'text-[#A8C5C2] hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={17} strokeWidth={1.9} />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#EEF3F0] flex">
      {/* ───── Desktop Sidebar ───── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#173B39] min-h-screen">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Image
            src="/branding/logo-kabupaten-magelang.webp"
            alt="Logo Kabupaten Magelang"
            width={36}
            height={48}
            priority
            className="shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              Kec. Bandongan
            </p>
            <p className="text-[#A8C5C2] text-xs leading-tight truncate">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-3 pt-4">
          <NavLinks />
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#A8C5C2] hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={17} strokeWidth={1.9} />
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
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-[#173B39] flex flex-col transform transition-transform duration-200 ease-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src="/branding/logo-kabupaten-magelang.webp"
              alt="Logo Kabupaten Magelang"
              width={30}
              height={40}
            />
            <p className="text-white text-sm font-semibold">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#A8C5C2] hover:text-white p-1"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-3 pt-4">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#A8C5C2] hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={17} strokeWidth={1.9} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-[#173B39] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#A8C5C2] hover:text-white p-1"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>
          <Image
            src="/branding/logo-kabupaten-magelang.webp"
            alt="Logo"
            width={22}
            height={30}
          />
          <span className="text-white text-sm font-semibold">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
