import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { UserLocation } from "../../types/app";

type FeedbackStatus = "idle" | "submitting" | "success" | "error";

type Props = {
  open: boolean;
  onClose: (reason: string) => void;
  category: string;
  setCategory: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  contact: string;
  setContact: (v: string) => void;
  status: FeedbackStatus;
  setStatus: (v: FeedbackStatus) => void;
  errorMsg: string;
  userLocation: UserLocation;
  addAuditLog: (action: string, details?: string) => void;
};

const CATEGORIES = ["系統錯誤", "資料問題", "功能建議", "介面體驗", "其他"];

export function FeedbackModal({
  open,
  onClose,
  category,
  setCategory,
  content,
  setContent,
  contact,
  setContact,
  status,
  setStatus,
  errorMsg,
  userLocation,
  addAuditLog,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => {
            onClose("click_outside");
            addAuditLog("feedback_modal_close", "click_outside");
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-coral-500/10 flex items-center justify-center text-coral-500">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">系統改進與意見回饋</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Feedback & System Improvements
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose("click_close_btn");
                  addAuditLog("feedback_modal_close", "click_close_btn");
                }}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-coral-500 hover:bg-coral-500/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "success" ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="py-6 flex flex-col items-center justify-center text-center"
              >
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">謝謝您的回饋！</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mb-4">
                  資料已成功送出並寫入資料庫，我們非常感謝您抽空提供建議，本系統將因您的回饋獲得最佳改善！
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose("success_close");
                    setStatus("idle");
                    setContent("");
                  }}
                  className="py-1.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  關閉視窗
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!content.trim()) return;
                  setStatus("submitting");
                  addAuditLog("feedback_submit_attempt", category);
                  try {
                    const res = await fetch("/api/feedback", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        category,
                        content,
                        contact: contact || null,
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        county: userLocation.county,
                        district: userLocation.district,
                        location_method: userLocation.location_method,
                      }),
                    });
                    if (!res.ok) throw new Error("送出失敗");
                    setStatus("success");
                    addAuditLog("feedback_submit_success", category);
                  } catch (err: any) {
                    setStatus("error");
                    addAuditLog("feedback_submit_error", err?.message || "error");
                  }
                }}
                className="space-y-4"
              >
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${
                        category === cat
                          ? "border-coral-400/50 bg-coral-500/15 text-coral-700 dark:text-coral-300"
                          : "border-slate-200 text-slate-500 dark:border-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="請詳述您遇見的狀況或對系統的想法..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Email 或 手機號碼 (方便我們向您回報進度)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                />
                {status === "error" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                    <AlertCircle size={14} />
                    <span>{errorMsg || "送出失敗，請重試"}</span>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose("click_cancel");
                      setStatus("idle");
                      addAuditLog("feedback_modal_close", "click_cancel");
                    }}
                    className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={status === "submitting" || !content.trim()}
                    className="inline-flex items-center gap-1.5 py-1.5 px-5 rounded-xl text-xs font-bold bg-coral-600 hover:bg-coral-500 text-white disabled:opacity-40"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> 送出中…
                      </>
                    ) : (
                      "送出回饋"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
