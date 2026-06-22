// 查詢列表下方的聯盟推廣跑馬燈。
// 連結為實際聯盟追蹤連結，採 rel="sponsored nofollow" 符合 Google 規範。
type MarqueePartner = { name: string; url: string };

const MARQUEE_PARTNERS: MarqueePartner[] = [
  { name: "Dyson", url: "https://igamepark.biz/3RVRZ" },
  { name: "momo購物", url: "https://shopsquare.co/3RVRb" },
  { name: "蝦皮購物", url: "https://buyforfun.biz/3RVRf" },
  { name: "Yahoo購物", url: "https://dreamstore.info/3RVRg" },
  { name: "HOLA 和樂家居", url: "https://whitehippo.net/3RVRi" },
  { name: "Anice 雅妮詩居家", url: "https://igrape.net/3RVRj" },
  { name: "伊萊克斯 Electrolux", url: "https://buyforfun.biz/3RVRn" },
  { name: "睡眠達人 irest", url: "https://dreamstore.info/3RVRp" },
  { name: "Pure Sleep 純好眠", url: "https://onelink.one/s/BABqC" },
  { name: "Mr. Bed 倍得先生", url: "https://onelink.one/s/1YEY7" },
  { name: "Presto 可易家電", url: "https://linkgo.one/s/PAeKf" },
  { name: "Emma 床墊", url: "https://onelink.one/s/05gyY" },
  { name: "LG 樂金", url: "https://linkgo.one/s/TqD3R" },
  { name: "hengstyle 恆隆行", url: "https://linkgo.one/s/pSCr3" },
  { name: "LOVEFU 大島樂眠", url: "https://onelink.one/s/uCk2J" },
];

const LINK_REL = "sponsored nofollow noopener";

function MarqueeRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={ariaHidden}>
      {MARQUEE_PARTNERS.map((p) => (
        <a
          key={p.name}
          href={p.url}
          target="_blank"
          rel={LINK_REL}
          tabIndex={ariaHidden ? -1 : undefined}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm font-bold text-slate-700 transition hover:border-coral-400 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-coral-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-coral-500/70" />
          {p.name}
        </a>
      ))}
    </div>
  );
}

export function AffiliateMarquee() {
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
        <span className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">買房後，順手準備</span>
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">廣告 · 合作推廣</span>
      </div>
      <div className="group relative mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 py-3 dark:border-slate-800 dark:bg-slate-900/40">
        {/* 兩側淡出遮罩 */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-50/90 to-transparent dark:from-slate-950/60" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50/90 to-transparent dark:from-slate-950/60" />
        <div className="affiliate-marquee-track flex w-max">
          <MarqueeRow />
          <MarqueeRow ariaHidden />
        </div>
      </div>
      <p className="mt-2 px-1 text-[11px] leading-5 text-slate-400">
        透過上方連結完成購買，本站可能獲得回饋，不影響您的價格。
      </p>
    </section>
  );
}
