import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";

const CATEGORIES = ["系統錯誤", "功能建議", "介面優化", "其它"] as const;

// 意見回饋表單：與 App 內的回饋彈窗共用同一個 /api/feedback 端點與 feedbacks 資料表。
export function FeedbackForm() {
  const [category, setCategory] = useState<string>("系統錯誤");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "success") {
    return (
      <section aria-label="意見回饋" className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-8 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white">謝謝您的回饋！</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          資料已成功送出並寫入資料庫，我們非常感謝您抽空提供建議，本系統將因您的回饋獲得最佳改善！
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setContent("");
            setContact("");
          }}
          className="mt-5 rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          再填一筆
        </button>
      </section>
    );
  }

  return (
    <section aria-label="意見回饋" className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-500/10 text-coral-500">
          <MessageSquare className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">系統改進與意見回饋</h3>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Feedback &amp; System Improvements</p>
        </div>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!content.trim()) return;
          setStatus("submitting");
          try {
            const res = await fetch("/api/feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category, content, contact: contact || null, location_method: "unknown" }),
            });
            if (res.ok) {
              setStatus("success");
            } else {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || "送出失敗，請稍後重試");
            }
          } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "網路連線異常");
          }
        }}
      >
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            意見分類 (Category) *
          </label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`cursor-pointer rounded-xl border px-2 py-1.5 text-center text-xs font-bold transition-all ${
                  category === cat
                    ? "border-coral-500/30 bg-coral-500/10 text-coral-500"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            詳細內容描述 (Content) *
          </label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="請詳述您遇見的狀況或對系統的想法..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            聯絡方式 (Contact - Optional)
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email 或 手機號碼 (方便我們向您回報進度)"
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg || "送出失敗，請重試"}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || !content.trim()}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-coral-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral-600 disabled:bg-coral-500/50"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              處理中...
            </>
          ) : (
            "送出回饋"
          )}
        </button>
      </form>
    </section>
  );
}
