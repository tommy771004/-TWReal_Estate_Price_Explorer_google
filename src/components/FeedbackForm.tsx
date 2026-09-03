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
      <section aria-label="意見回饋" className="mt-10 rounded-[28px] border border-outline-variant/40 bg-surface-container-high p-8 text-center shadow-[var(--md-elevation-1)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-on-surface">謝謝您的回饋！</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-on-surface-variant">
          資料已成功送出並寫入資料庫，我們非常感謝您抽空提供建議，本系統將因您的回饋獲得最佳改善！
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setContent("");
            setContact("");
          }}
          className="mt-5 rounded-full bg-secondary-container px-6 py-2 text-xs font-semibold text-on-secondary-container transition-colors hover:bg-secondary-container/80"
        >
          再填一筆
        </button>
      </section>
    );
  }

  return (
    <section aria-label="意見回饋" className="mt-10 rounded-[28px] border border-outline-variant/40 bg-surface-container-high p-6 sm:p-8 shadow-[var(--md-elevation-1)]">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-on-surface">系統改進與意見回饋</h3>
          <p className="text-[11px] font-medium text-on-surface-variant">Feedback &amp; System Improvements</p>
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
          <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
            意見分類 (Category) *
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-center text-xs font-semibold transition-colors ${
                  category === cat
                    ? "border-secondary bg-secondary-container text-on-secondary-container shadow-xs"
                    : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
            詳細內容描述 (Content) *
          </label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="請詳述您遇見的狀況或對系統的想法..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-outline bg-surface p-3.5 text-xs font-medium text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
            聯絡方式 (Contact - Optional)
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email 或 手機號碼 (方便我們向您回報進度)"
            className="w-full rounded-full border border-outline bg-surface px-4 py-2.5 text-xs font-medium text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-error/30 bg-error-container px-3.5 py-2.5 text-xs font-semibold text-on-error-container">
            <AlertCircle className="h-4 w-4 shrink-0 text-error" />
            <span>{errorMsg || "送出失敗，請重試"}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || !content.trim()}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-38"
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
