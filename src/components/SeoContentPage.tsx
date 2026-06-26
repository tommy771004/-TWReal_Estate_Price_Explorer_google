import { useEffect } from "react";
import type { SeoContentPage as SeoContentPageData } from "../content/seoPages";
import { AffiliateSlot, MortgageCalculatorCta } from "./AffiliateSlot";
import { SiteNav, SiteFooterNav } from "./SiteNav";
import { FeedbackForm } from "./FeedbackForm";
import { syncSeoContentMetadata } from "../lib/seo";

// 純資訊頁不顯示導購／房貸工具
const INFO_PATHS = new Set(["/about/", "/contact/", "/privacy/", "/methodology/", "/data-sources/"]);
// 與房貸高度相關的頁面才顯示房貸試算
const FINANCE_GUIDES = new Set([
  "/guides/mortgage-calculator/",
  "/guides/first-home-loan-subsidy/",
  "/guides/mortgage-approval-factors/",
  "/guides/refinance-mortgage/",
]);

export default function SeoContentPage({ page }: { page: SeoContentPageData }) {
  useEffect(() => {
    syncSeoContentMetadata(page);
  }, [page]);

  const isContact = page.path === "/contact/";
  const showMortgage = page.path.startsWith("/buying-guides/") || FINANCE_GUIDES.has(page.path);
  const showAffiliate = !INFO_PATHS.has(page.path);

  return (
    <>
    <SiteNav />
    <main data-seo-content-page className="mx-auto min-h-screen max-w-4xl px-5 py-12 text-slate-800 dark:text-slate-100 sm:px-8">
      <a href="/" className="text-sm font-bold text-coral-600 hover:underline">← 返回實價登錄查詢</a>
      <article className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{page.title}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">{page.intro}</p>
        {page.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-2xl font-black">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{paragraph}</p>)}
            {section.items && <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>
        ))}
        {/* 聯絡頁：意見回饋表單（寫入 feedbacks 資料表） */}
        {isContact && <FeedbackForm />}
        {/* 房貸試算 + 情境式聯盟導購：僅在相關頁面、且 .env 設定連結時才會顯示 */}
        {showMortgage && <MortgageCalculatorCta />}
        {showAffiliate && <AffiliateSlot />}

        {page.links && (
          <nav aria-label="本頁相關入口" className="mt-10">
            <h2 className="text-2xl font-black">相關頁面</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {page.links.map((link) => <li key={link.href}><a className="font-bold text-coral-600 hover:underline" href={link.href}>{link.label}</a></li>)}
            </ul>
          </nav>
        )}
      </article>
      <div className="mt-12">
        <SiteFooterNav />
      </div>
    </main>
    </>
  );
}
