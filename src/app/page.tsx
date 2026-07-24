"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  MessageSquare,
  Plus,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  FileText,
} from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  year: string;
  semester: string;
  classCode: string;
  lecturerName: string;
  course: { name: string; code: string };
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    deadline: string;
    status: string;
    _count?: { comments: number };
  }>;
}

export default function Home() {
  const { currentUser, loading: userLoading } = useUser();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch seeded class and tasks
    fetch("/api/tasks/seeded")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setClassData(resData.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Sistem Manajemen Akademik & Task Threading
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat datang kembali,{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                {currentUser?.name || "Pengguna"}
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Anda sedang berada di dashboard{" "}
              <span className="font-semibold text-white">EduPulse</span>. Aplikasi ini dilengkapi dengan sistem manajemen kelas, pembagian role Dosen vs Mahasiswa, serta{" "}
              <span className="text-cyan-300 font-semibold underline decoration-cyan-500/50">sistem komentar berjenjang mandiri</span>.
            </p>
          </div>

          {/* Quick Active Persona Badge */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-4 bg-slate-900/80 shadow-lg min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-cyan-500/20">
              {currentUser?.name
                ? currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "EP"}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Role Aktif Saat Ini:</p>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                {currentUser?.email?.includes("edupulse.ac.id") && !currentUser?.email?.includes("student") ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Dosen (Admin)
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-cyan-400" /> Mahasiswa (Member)
                  </>
                )}
              </p>
              <p className="text-[11px] text-indigo-300 mt-1 font-mono">
                {currentUser?.nim ? `NIM: ${currentUser.nim}` : currentUser?.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Classes & Active Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Kelas Terdaftar
            </h2>
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 font-medium">
              1 Kelas Aktif
            </span>
          </div>

          {/* Class Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300 shadow-xl bg-gradient-to-b from-slate-900/90 to-slate-950/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                  INF204 • Ganjil 2025/2026
                </span>
                <h3 className="text-xl font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                  IF-4A (Tugas Kelompok)
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Dosen: Wildan Budiawan Z, S.T., M.Kom.</span>
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end">
                <span className="text-xs text-slate-400">Kode Akses Kelas:</span>
                <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-800/40 tracking-wider">
                  EDUP88
                </span>
              </div>
            </div>

            {/* Task Item Inside Class */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  Tugas Aktif Terkait
                </h4>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      Deadline: H-7
                    </span>
                    <h5 className="font-bold text-white text-base">
                      Reverse Engineering Database Aplikasi Parkee
                    </h5>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    <Clock className="w-3.5 h-3.5" /> Open Status
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  Analisis alur transaksi Scan to Pay, buat PDM (Physical Data Model), DDL script, dan INSERT data dummy.
                </p>

                {/* Subtask checklist progress summary */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" /> 4 Sub-tasks (3 Selesai)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Thread Diskusi & Komentar
                    </span>
                  </div>

                  <Link
                    href="/tasks/cltask1parkee001"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-800/50 hover:bg-cyan-900/60 transition-all shadow-sm"
                  >
                    Buka Detail & Komentar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Portfolio Feature Highlights */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Highlight Fitur Portofolio Mandiri
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Modul Komentar Berjenjang (Threaded)
                </p>
                <p className="text-slate-400">
                  Dapat menambahkan balasan (reply) bertingkat pada komentar tugas dengan tampilan clean ala Reddit/GitHub.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Proteksi Akses Berbasis Role
                </p>
                <p className="text-slate-400">
                  Dosen/Admin dapat menghapus semua komentar. Mahasiswa (Member) hanya diizinkan menghapus komentar miliknya sendiri.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="font-bold text-purple-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-400" /> Live Role Simulator Widget
                </p>
                <p className="text-slate-400">
                  Pengunjung portofolio Anda bisa berpindah antara role Dosen dan Mahasiswa dengan 1-klik di header tanpa relogin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
