"use client";

import Link from "next/link";
import Logo from "../../public/logo.png"
import { LayoutDashboard, History, ScrollText } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-500/10 bg-[#08090d]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-500/20 to-yellow-700/5 shadow-lg shadow-amber-950/20"> */}
          {/*   <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.8)]" /> */}
          {/* </div> */}
          <Image src={Logo} width="100" height="100"/>

          <span className="hidden text-sm font-semibold tracking-[0.25em] text-amber-100 sm:block">
            Ryan& Co
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.025] p-1.5 shadow-2xl shadow-black/30">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-amber-400/10 hover:text-amber-300 sm:px-4"
          >
            <LayoutDashboard className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/history"
            className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-amber-400/10 hover:text-amber-300 sm:px-4"
          >
            <History className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>History</span>
          </Link>

          <Link
            href="/system-logs"
            className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-amber-400/10 hover:text-amber-300 sm:px-4"
          >
            <ScrollText className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">System Logs</span>
            <span className="sm:hidden">Logs</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

