"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  FileText,
} from "lucide-react";

import CommentForm from "@/components/comments/CommentForm";
import CommentItem, { CommentData } from "@/components/comments/CommentItem";

// --- Types ---

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

// --- Custom Hooks ---

function useTaskDetails(taskId: string) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTask(data.data);
      } else {
        // Handle gracefully, avoid hardcoded fallbacks in production if possible
        const seededRes = await fetch("/api/tasks/seeded");
        const seededData = await seededRes.json();
        if (seededData.success && seededData.data?.tasks?.[0]) {
          setTask(seededData.data.tasks[0]);
        }
      }
    } catch (error) {
      toast.error("Gagal memuat detail tugas.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return { task, loading, taskId: task?.id || taskId };
}

function useComments(activeTaskId: string) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!activeTaskId) return;
    try {
      const res = await fetch(`/api/tasks/${activeTaskId}/comments`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      toast.error("Gagal memuat diskusi.");
    } finally {
      setLoading(false);
    }
  }, [activeTaskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, fetchComments };
}

// --- Main Page Component ---

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const resolvedParams = use(params);
  const { currentUser } = useUser();

  // Use custom hooks to separate data logic from UI
  const { task, loading: taskLoading, taskId: resolvedTaskId } = useTaskDetails(resolvedParams.taskId);
  const { comments, loading: commentsLoading, fetchComments } = useComments(resolvedTaskId);

  // Role checks logic derived strictly from user data
  const isCurrentUserAdmin = currentUser?.email?.includes("edupulse.ac.id") || false;

  const handleAddComment = async (content: string) => {
    if (!currentUser || !task) return;

    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.id,
        content,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error || "Gagal menambahkan komentar");
      throw new Error(data.error);
    }

    toast.success("Komentar berhasil ditambahkan!");
    fetchComments();
  };

  const handleAddReply = async (parentId: string, content: string) => {
    if (!currentUser || !task) return;

    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.id,
        content,
        parentId,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error || "Gagal mengirim balasan");
      throw new Error(data.error);
    }

    toast.success("Balasan komentar berhasil dikirim!");
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/comments/${commentId}?userId=${currentUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Komentar berhasil dihapus!");
        fetchComments();
      } else {
        toast.error(data.error || "Tidak diizinkan menghapus komentar ini");
      }
    } catch (err) {
      toast.error("Gagal menghapus komentar");
    }
  };

  if (taskLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        Memuat detail tugas...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
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
              {task?.title || "Judul Tugas Tidak Ditemukan"}
            </h1>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>
                Dibuat oleh:{" "}
                <strong className="text-slate-200">
                  {task?.createdBy?.name || "Unknown"}
                </strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Calendar className="w-3.5 h-3.5" /> Deadline:{" "}
                {task?.deadline
                  ? new Date(task.deadline).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Tidak ditentukan"}
              </span>
            </p>
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Deskripsi Tugas
          </h3>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300 leading-relaxed">
            {task?.description || "Tidak ada deskripsi tersedia."}
          </div>
        </div>

        {/* Sub-tasks Section */}
        {task?.subTasks && task.subTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Checklist Sub-tasks (
              {task.subTasks.filter((s) => s.isCompleted).length}/
              {task.subTasks.length} Selesai)
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
                    <CheckCircle
                      className={`w-4 h-4 ${
                        sub.isCompleted ? "text-emerald-400" : "text-slate-600"
                      }`}
                    />
                    {sub.title}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                      sub.isCompleted
                        ? "bg-emerald-900/50 text-emerald-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
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
              <h2 className="text-xl font-bold text-white">
                Diskusi & Komentar Tugas
              </h2>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-mono font-bold">
                {comments.length} Komentar
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sistem komentar berjenjang mandiri (*Nested Comment System*)
              dengan kontrol akses role-based.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Posting sebagai:</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              {isCurrentUserAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />{" "}
                  {currentUser?.name} (Dosen)
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />{" "}
                  {currentUser?.name} (Mahasiswa)
                </>
              )}
            </span>
          </div>
        </div>

        {/* Create Root Comment Form */}
        <CommentForm
          currentUser={currentUser}
          onSubmit={handleAddComment}
          placeholder="Tuliskan pertanyaan atau diskusi mengenai tugas ini..."
        />

        {/* Comments Tree Display */}
        {commentsLoading ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Memuat diskusi komentar...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold">Belum ada komentar di tugas ini.</p>
            <p className="text-slate-500">
              Jadilah yang pertama untuk memulai diskusi!
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser as any}
                isAdmin={isCurrentUserAdmin}
                onDelete={handleDeleteComment}
                onReplySubmit={handleAddReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
