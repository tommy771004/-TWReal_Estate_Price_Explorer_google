import { ChevronRight } from "lucide-react";
import { FEATURED_QUERY_INTENTS, SEO_CONTENT_UPDATED } from "../../constants/app-ui";
import { SiteFooterNav } from "../SiteNav";

/** 首頁底部 SEO 說明／FAQ／頁尾導覽 */
export function SeoAboutSection() {
  return (
    <div className="mx-auto mt-6 w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex flex-col gap-10 rounded-[1.75rem] border border-slate-200/50 bg-white/80 p-5 shadow-none dark:border-slate-800/60 dark:bg-slate-900/40 sm:gap-12 sm:p-8">
        <section className="flex flex-col gap-5" aria-labelledby="search-intent-overview">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral-700 dark:text-coral-400">
              台灣房價查詢
            </span>
            <span className="h-px w-8 bg-coral-500/30" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              實價登錄
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h2
              id="search-intent-overview"
              className="text-xl font-black tracking-tight text-ink dark:text-white sm:text-2xl"
            >
              台灣實價登錄查詢與房價地圖
            </h2>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
              查詢臺北市、新北市、桃園市、臺中市、臺南市、高雄市與全台各縣市的實價登錄成交紀錄，
              支援買賣、預售屋與租賃資料，並可依總價、單價、坪數、屋齡與地圖位置快速篩選。
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {FEATURED_QUERY_INTENTS.map((intent) => (
                <span
                  key={intent}
                  className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400"
                >
                  {intent}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3
              id="search-coverage"
              className="text-base font-black tracking-tight text-ink dark:text-white sm:text-lg"
            >
              可查詢的實價登錄範圍
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  title: "查城市與行政區",
                  body: "支援全台縣市與行政區切換，可快速比較不同生活圈、區域房價與成交紀錄。",
                },
                {
                  title: "查買賣、預售屋、租賃",
                  body: "同一個查詢介面即可切換住宅買賣、預售屋成交與租賃資料，不必分站重找。",
                },
                {
                  title: "查單價、總價與坪數",
                  body: "可依總價、單價、坪數、屋齡與關鍵字做條件過濾，搭配地圖檢視更快找到目標區域。",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-950/35"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-coral-500/10 text-[11px] font-black text-coral-600 dark:text-coral-400">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-black tracking-tight text-ink dark:text-white">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="flex flex-col gap-3 border-t border-slate-200/70 pt-8 dark:border-white/10"
          aria-labelledby="about-real-estate-search"
        >
          <h2
            id="about-real-estate-search"
            className="text-xl font-black tracking-tight text-ink dark:text-white sm:text-2xl"
          >
            關於實價登錄查詢
          </h2>
          <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 sm:text-[15px]">
            實價登錄查詢是一個免費的台灣房地產實價登錄查詢工具，整合
            <a
              href="https://lvr.land.moi.gov.tw/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 font-bold text-coral-700 underline decoration-coral-400/50 underline-offset-4 hover:text-coral-600 dark:text-coral-400"
            >
              內政部不動產交易實價查詢服務網
            </a>
            開放資料，提供買賣、預售屋與租賃成交紀錄的快速搜尋。不需註冊即可查詢各縣市與行政區的總價、單價、坪數、樓層、屋齡與歷史交易資料，並透過地圖模式了解周邊設施與地理位置。
          </p>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            頁面資訊更新：
            <time dateTime={SEO_CONTENT_UPDATED}>{SEO_CONTENT_UPDATED}</time>
            ；成交資料依官方發布時程同步。
          </p>
        </section>

        <section
          className="flex flex-col gap-3 border-t border-slate-200/70 pt-8 dark:border-white/10"
          aria-labelledby="real-estate-faq"
        >
          <h2
            id="real-estate-faq"
            className="text-xl font-black tracking-tight text-ink dark:text-white sm:text-2xl"
          >
            常見問題 FAQ
          </h2>
          <div className="flex flex-col gap-2.5">
            <details className="group overflow-hidden rounded-xl border border-slate-200/50 bg-white/90 shadow-none dark:border-slate-700/50 dark:bg-slate-800/60">
              <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 sm:px-5 [&::-webkit-details-marker]:hidden">
                這個網站是免費的嗎？
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-slate-100 p-4 pt-3 text-sm font-medium leading-relaxed text-slate-500 dark:border-white/5 dark:text-slate-400 sm:px-5">
                是的，這個網站完全免費提供大家查詢使用，旨在提供更友善、直覺的實價登錄查詢體驗。
              </div>
            </details>
            <details className="group overflow-hidden rounded-xl border border-slate-200/50 bg-white/90 shadow-none dark:border-slate-700/50 dark:bg-slate-800/60">
              <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 sm:px-5 [&::-webkit-details-marker]:hidden">
                資料來源與更新頻率為何？
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-slate-100 p-4 pt-3 text-sm font-medium leading-relaxed text-slate-500 dark:border-white/5 dark:text-slate-400 sm:px-5">
                資料來源為內政部不動產交易實價查詢服務網的開放資料。更新頻率依據官方發布時程，通常為每月 3
                次（約每 10 天更新一次）。
              </div>
            </details>
            <details className="group overflow-hidden rounded-xl border border-slate-200/50 bg-white/90 shadow-none dark:border-slate-700/50 dark:bg-slate-800/60">
              <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 sm:px-5 [&::-webkit-details-marker]:hidden">
                為什麼地圖上有些物件的定位不準確？
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-slate-100 p-4 pt-3 text-sm font-medium leading-relaxed text-slate-500 dark:border-white/5 dark:text-slate-400 sm:px-5">
                由於政府開放資料為了保護隱私，門牌號碼多半有區間遮蔽（例如：中正路1~30號），因此系統無法取得精確座標，這類地址會盡量定位在該路段附近。詳細位置請參考卡片內的門牌資訊。
              </div>
            </details>
          </div>
        </section>
      </div>

      <div className="mt-10">
        <SiteFooterNav />
      </div>
    </div>
  );
}
