"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CornerDownRight,
  MessageSquare,
  Send,
  Trash2,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  parentId?: string | null;
  user: {
    id: string;
    name: string;
    username: string;
    email?: string;
    nim?: string;
    profilePicture?: string;
  };
  userClass?: {
    role: string;
  };
  replies?: CommentItem[];
}

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  class: {
    name: string;
    classCode: string;
    lecturerName: string;
    course: { name: string; code: string };
  };
  createdBy: {
    name: string;
    email: string;
  };
  subTasks: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
}

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.taskId;

  const { currentUser } = useUser();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // New comment state
  const [newCommentText, setNewCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active reply input state (which comment ID is currently being replied to)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [notificationMsg, setNotificationMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchTaskAndComments = async () => {
    try {
      // 1. Fetch Task Details (fallback to seeded task if dynamic param match fail)
      const taskRes = await fetch(`/api/tasks/${taskId}`);
      const taskData = await taskRes.json();

      let targetTaskId = taskId;
      if (taskData.success && taskData.data) {
        setTask(taskData.data);
      } else {
        // Fallback: get seeded task
        const seededRes = await fetch("/api/tasks/seeded");
        const seededData = await seededRes.json();
        if (seededData.success && seededData.data?.tasks?.[0]) {
          setTask(seededData.data.tasks[0]);
          targetTaskId = seededData.data.tasks[0].id;
        }
      }

      // 2. Fetch Comments
      const commentsRes = await fetch(`/api/tasks/${targetTaskId}/comments`);
      const commentsData = await commentsRes.json();
      if (commentsData.success) {
        setComments(commentsData.data || []);
      }
    } catch (err) {
      console.error("Error loading task detail or comments", err);
    } finally {
      setLoading(false);
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskAndComments();
  }, [taskId]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Submit root comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser || !task) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          content: newCommentText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewCommentText("");
        showToast("Komentar berhasil ditambahkan!", "success");
        fetchTaskAndComments();
      } else {
        showToast(data.error || "Gagal menambahkan komentar", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply to a comment
  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim() || !currentUser || !task) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          content: replyText,
          parentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText("");
        setReplyingToId(null);
        showToast("Balasan komentar berhasil dikirim!", "success");
        fetchTaskAndComments();
      } else {
        showToast(data.error || "Gagal mengirim balasan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}?userId=${currentUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        showToast("Komentar berhasil dihapus!", "success");
        fetchTaskAndComments();
      } else {
        showToast(data.error || "Tidak diizinkan menghapus komentar ini", "error");
      }
    } catch (err) {
      showToast("Gagal menghapus komentar", "error");
    }
  };

  // Helper check if currentUser is Admin
  const isCurrentUserAdmin = currentUser?.email?.includes("edupulse.ac.id") && !currentUser?.email?.includes("student");

  return (
    <div className="space-y-8 pb-12">
      {/* Top Notification Toast */}
      {notificationMsg && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 animate-bounce ${
            notificationMsg.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
              : "bg-rose-950/90 text-rose-300 border-rose-500/40"
          }`}
        >
          {notificationMsg.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          {notificationMsg.text}
        </div>
      )}

      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      {/* Task Header & Details Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                {task?.class?.course?.code || "INF204"} • {task?.class?.name || "IF-4A"}
              </span>
              <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/40 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Open Task
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {task?.title || "Reverse Engineering Database Aplikasi Parkee"}
            </h1>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Dibuat oleh: <strong className="text-slate-200">{task?.createdBy?.name || "Wildan Budiawan Z"}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Calendar className="w-3.5 h-3.5" /> Deadline: {task?.deadline ? new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "7 Hari Lagi"}
              </span>
            </p>
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Tugas</h3>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300 leading-relaxed">
            {task?.description || "Analisis alur transaksi Scan to Pay pada aplikasi Parkee, buat Physical Data Model (PDM), script DDL SQL, dan INSERT data dummy."}
          </div>
        </div>

        {/* Sub-tasks Section */}
        {task?.subTasks && task.subTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Checklist Sub-tasks ({task.subTasks.filter(s => s.isCompleted).length}/{task.subTasks.length} Selesai)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {task.subTasks.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    sub.isCompleted
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${sub.isCompleted ? "text-emerald-400" : "text-slate-600"}`} />
                    {sub.title}
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${sub.isCompleted ? "bg-emerald-900/50 text-emerald-300" : "bg-slate-800 text-slate-500"}`}>
                    {sub.isCompleted ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flagship Feature: Comment & Discussion Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 space-y-6 bg-slate-950/80 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Diskusi & Komentar Tugas</h2>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-mono font-bold">
                {comments.length} Komentar
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sistem komentar berjenjang mandiri (*Nested Comment System*) dengan kontrol akses role-based.
            </p>
          </div>

          {/* User Role Reminder */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Posting sebagai:</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              {isCurrentUserAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> {currentUser?.name} (Dosen)
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> {currentUser?.name} (Mahasiswa)
                </>
              )}
            </span>
          </div>
        </div>

        {/* Create Root Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 focus-within:border-indigo-500/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : "EP"}
            </div>
            <span className="text-xs font-semibold text-slate-200">
              Tulis komentar baru...
            </span>
          </div>

          <textarea
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Tuliskan pertanyaan atau diskusi mengenai tugas ini..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newCommentText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-500 hover:to-cyan-500 transition-all disabled:opacity-50 shadow-md shadow-indigo-950/50"
            >
              <Send className="w-3.5 h-3.5" /> {submitting ? "Mengirim..." : "Kirim Komentar"}
            </button>
          </div>
        </form>

        {/* Comments Tree Display */}
        {commentsLoading ? (
          <div className="text-center py-8 text-xs text-slate-500">Memuat diskusi komentar...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold">Belum ada komentar di tugas ini.</p>
            <p className="text-slate-500">Jadilah yang pertama untuk memulai diskusi!</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {comments.map((comment) => {
              const isCommentAdmin = comment.userClass?.role === "ADMIN" || comment.user?.email?.includes("edupulse.ac.id") || comment.user?.username?.includes("dosen");
              const canDelete = isCurrentUserAdmin || currentUser?.id === comment.userId;

              return (
                <div key={comment.id} className="space-y-3">
                  {/* Root Comment Box */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                          {comment.user?.name ? comment.user.name.substring(0, 2).toUpperCase() : "U"}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{comment.user?.name}</span>
                            {isCommentAdmin ? (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-amber-400" /> Dosen
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                                Mahasiswa
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {new Date(comment.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </div>
                      </div>

                      {/* Delete button (Role Restricted) */}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Hapus Komentar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed pl-12">{comment.content}</p>

                    {/* Action Bar (Reply trigger) */}
                    <div className="pl-12 flex items-center gap-4 pt-1">
                      <button
                        onClick={() => {
                          setReplyingToId(replyingToId === comment.id ? null : comment.id);
                          setReplyText("");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" /> Balas Komentar
                      </button>
                    </div>

                    {/* In-line Reply Input Box */}
                    {replyingToId === comment.id && (
                      <div className="ml-12 mt-3 p-3 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold">
                          <span>Membalas {comment.user?.name}...</span>
                          <button
                            onClick={() => setReplyingToId(null)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            Batal
                          </button>
                        </div>
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Tuliskan balasan Anda..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleAddReply(comment.id)}
                            disabled={submitting || !replyText.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                          >
                            Kirim Balasan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nested Replies Rendering */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 sm:ml-12 space-y-3 border-l-2 border-indigo-900/50 pl-4">
                      {comment.replies.map((reply) => {
                        const isReplyAdmin = reply.userClass?.role === "ADMIN" || reply.user?.email?.includes("edupulse.ac.id") || reply.user?.username?.includes("dosen");
                        const canDeleteReply = isCurrentUserAdmin || currentUser?.id === reply.userId;

                        return (
                          <div
                            key={reply.id}
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 relative"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                                  {reply.user?.name ? reply.user.name.substring(0, 2).toUpperCase() : "R"}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-200">{reply.user?.name}</span>
                                    {isReplyAdmin ? (
                                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50">
                                        Dosen
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                                        Mahasiswa
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500 block">
                                    {new Date(reply.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                                  </span>
                                </div>
                              </div>

                              {canDeleteReply && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Hapus Balasan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 pl-9 leading-relaxed">{reply.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
