import { useMemo, useRef, useState } from "react";
import {
  AFFILIATE_LINK_REL,
  offersByCategory,
  trackAffiliateEvent,
  useAffiliateImpressionTracking,
  useAffiliateOffers,
} from "../lib/affiliates";

const CATEGORY_LABELS: Record<string, string> = {
  furniture: "家具",
  appliance: "家電 / 3C",
  home: "居家 / 裝潢",
  finance: "房貸 / 金融",
};

type AffiliateSlotProps = {
  /** 限定分類（家具/家電/居家/金融等）；未指定則混合呈現 */
  category?: string;
  /** 最多顯示幾張 */
  limit?: number;
  /** 區塊標題；預設依分類自動帶入 */
  title?: string;
  className?: string;
};

/**
 * 資料庫驅動的聯盟廣告位（見 docs/affiliate-integration-spec.md）。
 * 資料來自 /api/affiliates；沒有符合條件的啟用資料時回傳 null，不佔版面。
 */
export function AffiliateSlot({ category, limit = 4, title, className }: AffiliateSlotProps) {
  const offers = useAffiliateOffers();
  const containerRef = useRef<HTMLElement>(null);
  const partners = useMemo(() => offersByCategory(offers, category).slice(0, limit), [offers, category, limit]);
  useAffiliateImpressionTracking(containerRef, partners, "slot");

  if (partners.length === 0) return null;

  const heading = title ?? (category ? `${CATEGORY_LABELS[category] ?? category}推薦` : "買房後，順手準備");

  return (
    <aside
      ref={containerRef}
      aria-label="贊助推薦"
      className={`mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/40 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{heading}</h3>
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          廣告 · 合作推廣
        </span>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {partners.map((o) => (
          <li key={o.id}>
            <a
              data-affiliate-id={o.id}
              href={o.url}
              target="_blank"
              rel={AFFILIATE_LINK_REL}
              onClick={() => trackAffiliateEvent("affiliate_click", o, "slot")}
              className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white/80 p-4 transition hover:border-coral-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800 group-hover:text-coral-600 dark:text-slate-100">{o.partner ?? o.title}</span>
                {o.sponsored && <span className="text-[10px] font-medium text-slate-400">贊助</span>}
              </div>
              <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{o.description}</p>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-5 text-slate-400">
        透過上方連結完成購買或申辦，本站可能獲得回饋，不影響您的價格。
      </p>
    </aside>
  );
}

/**
 * 房貸試算 CTA。輸入總價 → 估算每月本利，下方導流至房貸/信貸聯盟連結。
 * 這是本站轉換最高的位置：使用者剛看完房價，正準備評估貸款。
 */
export function MortgageCalculatorCta({ defaultPrice }: { defaultPrice?: number }) {
  const [price, setPrice] = useState<number>(defaultPrice ?? 1500); // 單位：萬元
  const [rate, setRate] = useState<number>(2.2); // 年利率 %
  const [years, setYears] = useState<number>(30);
  const [ratio, setRatio] = useState<number>(80); // 貸款成數 %

  const offers = useAffiliateOffers();
  const loanPartner = offersByCategory(offers, "finance")[0];

  const monthly = useMemo(() => {
    const principal = price * 10000 * (ratio / 100); // 元
    const months = years * 12;
    const r = rate / 100 / 12;
    if (r === 0) return Math.round(principal / months);
    const m = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(m);
  }, [price, rate, years, ratio]);

  const fmt = (n: number) => n.toLocaleString("zh-TW");

  return (
    <aside aria-label="房貸試算" className="mt-10 rounded-2xl border border-coral-200/70 bg-coral-50/50 p-5 dark:border-coral-900/40 dark:bg-coral-950/20">
      <h3 className="text-base font-black text-slate-800 dark:text-slate-100">房貸月付試算</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="總價（萬）" value={price} step={50} min={100} onChange={setPrice} />
        <Field label="貸款成數（%）" value={ratio} step={5} min={10} max={90} onChange={setRatio} />
        <Field label="年利率（%）" value={rate} step={0.1} min={0} onChange={setRate} />
        <Field label="年期" value={years} step={5} min={5} max={40} onChange={setYears} />
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">估計每月本利攤還</span>
        <span className="text-2xl font-black text-coral-600 dark:text-coral-400">NT$ {fmt(monthly)}</span>
        <span className="text-xs text-slate-400">/ 月</span>
      </div>
      <p className="mt-1 text-[11px] leading-5 text-slate-400">
        本利平均攤還估算，未含寬限期與費用，僅供參考，實際以銀行核貸為準。
      </p>
      {loanPartner && (
        <a
          data-affiliate-id={loanPartner.id}
          href={loanPartner.url}
          target="_blank"
          rel={AFFILIATE_LINK_REL}
          onClick={() => trackAffiliateEvent("affiliate_click", loanPartner, "mortgage_cta")}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-coral-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coral-700"
        >
          {loanPartner.ctaLabel} →
        </a>
      )}
    </aside>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </label>
  );
}
