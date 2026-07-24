"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { GraduationCap, Shield, User, BookOpen, Layers, CheckCircle2 } from "lucide-react";

export const Navbar = () => {
  const { currentUser, users, setCurrentUser } = useUser();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                EduPulse
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Academic Classroom Platform</p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Dashboard
          </Link>
          <Link
            href="/#classes"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Kelas Saya
          </Link>
        </nav>

        {/* Role Switcher Widget */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-slate-400 font-medium">Simulasi Role Active:</span>
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
              {currentUser?.email?.includes("edupulse.ac.id") && !currentUser?.email?.includes("student") ? (
                <>
                  <Shield className="w-3 h-3 text-amber-400 inline" /> Dosen / Admin
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-cyan-400 inline" /> Mahasiswa (Member)
                </>
              )}
            </span>
          </div>

          <div className="relative">
            <select
              value={currentUser?.id || ""}
              onChange={(e) => {
                const target = users.find((u) => u.id === e.target.value);
                if (target) setCurrentUser(target);
              }}
              className="bg-slate-900 text-slate-200 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-400/50 transition-all cursor-pointer shadow-md shadow-indigo-950/50"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200 py-1">
                  👤 {u.name} {u.nim ? `(${u.nim})` : "[Dosen]"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
