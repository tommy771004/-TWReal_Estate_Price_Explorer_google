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
            className="w-full max-w-md bg-surface-container-high rounded-[28px] border border-outline-variant/40 p-6 shadow-[var(--md-elevation-3)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">系統改進與意見回饋</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Feedback &amp; System Improvements
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose("click_close_btn");
                  addAuditLog("feedback_modal_close", "click_close_btn");
                }}
                className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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
                <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-base font-bold text-on-surface mb-1">謝謝您的回饋！</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mb-4">
                  資料已成功送出並寫入資料庫，我們非常感謝您抽空提供建議，本系統將因您的回饋獲得最佳改善！
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose("success_close");
                    setStatus("idle");
                    setContent("");
                  }}
                  className="py-2 px-6 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container rounded-full text-xs font-semibold transition-colors cursor-pointer"
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
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                        category === cat
                          ? "border-secondary bg-secondary-container text-on-secondary-container shadow-xs"
                          : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
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
                  className="w-full resize-none rounded-2xl border border-outline bg-surface p-3.5 text-xs font-medium text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Email 或 手機號碼 (方便我們向您回報進度)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-full border border-outline bg-surface px-4 py-2.5 text-xs font-medium text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {status === "error" && (
                  <div className="flex items-center gap-2 rounded-2xl border border-error/30 bg-error-container px-3.5 py-2.5 text-xs font-semibold text-on-error-container">
                    <AlertCircle size={14} className="shrink-0 text-error" />
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
                    className="py-2 px-5 bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface rounded-full text-xs font-semibold transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={status === "submitting" || !content.trim()}
                    className="inline-flex items-center gap-1.5 py-2 px-6 rounded-full text-xs font-semibold bg-primary hover:bg-primary/90 text-on-primary shadow-xs transition-colors disabled:opacity-38"
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
