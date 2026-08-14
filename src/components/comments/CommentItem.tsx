import React, { useState } from "react";
import { CornerDownRight, ShieldCheck, Trash2 } from "lucide-react";
import CommentForm from "./CommentForm";

export interface CommentData {
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
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  currentUser: { id: string; name: string; email: string } | null;
  isAdmin: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
}

export default function CommentItem({
  comment,
  currentUser,
  isAdmin,
  onDelete,
  onReplySubmit,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);

  // Use the proper role from DB if available, fallback to some basic heuristics if needed
  const isCommentAdmin =
    comment.userClass?.role === "ADMIN" ||
    comment.user?.email?.includes("edupulse.ac.id") ||
    comment.user?.username?.includes("dosen");

  const canDelete = isAdmin || currentUser?.id === comment.userId;

  const handleReply = async (content: string) => {
    await onReplySubmit(comment.id, content);
    setIsReplying(false);
  };

  return (
    <div className="space-y-3">
      {/* Root Comment Box */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {comment.user?.name ? comment.user.name.substring(0, 2).toUpperCase() : "U"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  {comment.user?.name}
                </span>
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
                {new Date(comment.createdAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>

          {/* Delete button (Role Restricted) */}
          {canDelete && (
            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
                  onDelete(comment.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Hapus Komentar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-200 leading-relaxed pl-12">
          {comment.content}
        </p>

        {/* Action Bar (Reply trigger) */}
        <div className="pl-12 flex items-center gap-4 pt-1">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <CornerDownRight className="w-3.5 h-3.5" /> Balas Komentar
          </button>
        </div>

        {/* In-line Reply Input Box */}
        {isReplying && (
          <CommentForm
            currentUser={currentUser}
            onSubmit={handleReply}
            isReply
            onCancel={() => setIsReplying(false)}
            buttonText="Kirim Balasan"
            placeholder={`Membalas ${comment.user?.name}...`}
          />
        )}
      </div>

      {/* Nested Replies Rendering */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 sm:ml-12 space-y-3 border-l-2 border-indigo-900/50 pl-4">
          {comment.replies.map((reply) => {
            const isReplyAdmin =
              reply.userClass?.role === "ADMIN" ||
              reply.user?.email?.includes("edupulse.ac.id") ||
              reply.user?.username?.includes("dosen");
            const canDeleteReply = isAdmin || currentUser?.id === reply.userId;

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
                        <span className="text-xs font-bold text-slate-200">
                          {reply.user?.name}
                        </span>
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
                        {new Date(reply.createdAt).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {canDeleteReply && (
                    <button
                      onClick={() => {
                        if (confirm("Apakah Anda yakin ingin menghapus balasan ini?")) {
                          onDelete(reply.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Hapus Balasan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 pl-9 leading-relaxed">
                  {reply.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
