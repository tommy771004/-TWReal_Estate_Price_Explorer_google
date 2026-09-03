// 查詢列表下方的聯盟推廣跑馬燈。
// 資料來源：/api/affiliates（統一集中於 affiliates 資料表管理，見 docs/affiliate-integration-spec.md）。
// 連結為實際聯盟追蹤連結，採 rel="sponsored nofollow" 符合 Google 規範。
import { useRef } from "react";
import {
  AFFILIATE_LINK_REL,
  trackAffiliateEvent,
  useAffiliateImpressionTracking,
  useAffiliateOffers,
  type AffiliateOffer,
} from "../lib/affiliates";

function MarqueeRow({ offers, ariaHidden }: { offers: AffiliateOffer[]; ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 pr-2.5" aria-hidden={ariaHidden}>
      {offers.map((o) => (
        <a
          key={o.id}
          data-affiliate-id={ariaHidden ? undefined : o.id}
          href={o.url}
          target="_blank"
          rel={AFFILIATE_LINK_REL}
          tabIndex={ariaHidden ? -1 : undefined}
          onClick={() => trackAffiliateEvent("affiliate_click", o, "marquee")}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-outline bg-surface px-4 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-highest hover:border-primary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {o.partner || o.title}
        </a>
      ))}
    </div>
  );
}

// 緊湊版導購：用於物件詳情彈窗等空間有限處。無動畫、自動換行。
export function AffiliateChips({ title = "為這間房準備", limit = 8 }: { title?: string; limit?: number }) {
  const offers = useAffiliateOffers();
  const containerRef = useRef<HTMLDivElement>(null);
  const partners = offers.slice(0, limit);
  useAffiliateImpressionTracking(containerRef, partners, "chips");

  if (partners.length === 0) return null;

  return (
    <div ref={containerRef} className="rounded-[24px] border border-outline-variant/40 bg-surface-container p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-on-surface">{title}</span>
        <span className="rounded-full bg-surface-container-highest px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant">廣告</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {partners.map((o) => (
          <a
            key={o.id}
            data-affiliate-id={o.id}
            href={o.url}
            target="_blank"
            rel={AFFILIATE_LINK_REL}
            onClick={() => trackAffiliateEvent("affiliate_click", o, "chips")}
            className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-highest hover:border-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {o.partner || o.title}
          </a>
        ))}
      </div>
    </div>
  );
}

export function AffiliateMarquee() {
  const offers = useAffiliateOffers();
  const containerRef = useRef<HTMLDivElement>(null);
  useAffiliateImpressionTracking(containerRef, offers, "marquee");

  if (offers.length === 0) return null;

  return (
    <section
      aria-label="贊助推廣"
      className="mt-2 mb-8 px-1.5 sm:px-6"
    >
      <style>{`
        @keyframes affiliate-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .affiliate-marquee-track { animation: affiliate-marquee 40s linear infinite; }
        .affiliate-marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .affiliate-marquee-track { animation: none; } }
      `}</style>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-on-surface-variant">買房後，順手準備</span>
        <span className="rounded-full bg-surface-container-highest px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant">廣告 · 合作推廣</span>
      </div>
      <div ref={containerRef} className="group relative mt-2 overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container py-3.5 shadow-xs">
        {/* 兩側淡出遮罩 */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface-container to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface-container to-transparent" />
        <div className="affiliate-marquee-track flex w-max">
          <MarqueeRow offers={offers} />
          <MarqueeRow offers={offers} ariaHidden />
        </div>
      </div>
      <p className="mt-2 px-1 text-[11px] leading-5 text-slate-400">
        透過上方連結完成購買，本站可能獲得回饋，不影響您的價格。
      </p>
    </section>
  );
}
