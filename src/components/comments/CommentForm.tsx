import React, { useState } from "react";
import { Send } from "lucide-react";

interface CommentFormProps {
  currentUser: { name?: string } | null;
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  isReply?: boolean;
  onCancel?: () => void;
}

export default function CommentForm({
  currentUser,
  onSubmit,
  placeholder = "Tuliskan komentar...",
  buttonText = "Kirim Komentar",
  isReply = false,
  onCancel,
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(text);
      setText(""); // Clear on success
    } catch (err) {
      // Error is handled by parent, we just ensure loading state resets
    } finally {
      setSubmitting(false);
    }
  };

  if (isReply) {
    return (
      <div className="ml-12 mt-3 p-3 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold">
          <span>Membalas komentar...</span>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleSubmit()}
            disabled={submitting || !text.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {submitting ? "Mengirim..." : buttonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 focus-within:border-indigo-500/50 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
          {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : "U"}
        </div>
        <span className="text-xs font-semibold text-slate-200">
          Tulis komentar baru...
        </span>
      </div>

      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-500 hover:to-cyan-500 transition-all disabled:opacity-50 shadow-md shadow-indigo-950/50"
        >
          <Send className="w-3.5 h-3.5" /> {submitting ? "Mengirim..." : buttonText}
        </button>
      </div>
    </form>
  );
}
