'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Camera, Menu, X } from 'lucide-react';
import { navItems } from '../data/landingContent';

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? 'border-b border-[#DFD9D2]/80 bg-[#F7F6F3]/95 shadow-sm backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 focus-visible:rounded-xl">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#5A2F3E] text-[#DDC89C] shadow-sm">
            <Camera className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate text-sm font-black tracking-tight text-[#302C2E]">Wedding Photo Planet</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-xs font-bold text-[#5B5558] transition hover:bg-white/80 hover:text-[#5A2F3E]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="rounded-xl px-4 py-2 text-xs font-extrabold text-[#5A2F3E] transition hover:bg-white/80">
            Login
          </Link>
          <Link href="/contact" className="rounded-xl bg-[#8D5265] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#774255]">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid size-11 place-items-center rounded-xl border border-[#DFD9D2] bg-white text-[#5A2F3E] lg:hidden"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <div className={`lg:hidden ${open ? 'block' : 'hidden'}`}>
        <nav className="mx-4 mb-4 rounded-2xl border border-[#DFD9D2] bg-white p-3 shadow-xl" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-bold text-[#5B5558] hover:bg-[#F7F6F3] hover:text-[#5A2F3E]">
              {item.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#ECE8E3] pt-3">
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl border border-[#DFD9D2] px-3 py-3 text-center text-xs font-extrabold text-[#5A2F3E]">
              Login
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="rounded-xl bg-[#8D5265] px-3 py-3 text-center text-xs font-extrabold text-white">
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
