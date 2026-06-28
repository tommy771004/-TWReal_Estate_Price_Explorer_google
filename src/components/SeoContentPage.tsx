import { useEffect } from "react";
import type { SeoContentPage as SeoContentPageData } from "../content/seoPages";
import { AffiliateSlot, MortgageCalculatorCta } from "./AffiliateSlot";
import { SiteNav, SiteFooterNav } from "./SiteNav";
import { FeedbackForm } from "./FeedbackForm";
import { syncSeoContentMetadata } from "../lib/seo";
import { buildBreadcrumbTrail } from "../lib/seoContent";

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
  const breadcrumb = buildBreadcrumbTrail(page);

  return (
    <>
    <SiteNav />
    <main data-seo-content-page className="mx-auto min-h-screen max-w-4xl px-5 py-12 text-slate-800 dark:text-slate-100 sm:px-8">
      <nav aria-label="breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          {breadcrumb.map((crumb, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-x-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {isLast ? (
                  <span aria-current="page" className="font-bold text-slate-700 dark:text-slate-200">{crumb.name}</span>
                ) : (
                  <a href={crumb.path} className="font-bold text-coral-600 hover:underline">{crumb.name}</a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <article className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{page.title}</h1>
        {page.answer && (
          <p
            data-answer-first
            className="mt-6 rounded-2xl border-l-4 border-coral-500 bg-coral-50 px-5 py-4 text-base font-semibold leading-7 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
          >
            {page.answer}
          </p>
        )}
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">{page.intro}</p>
        {page.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-2xl font-black">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{paragraph}</p>)}
            {section.items && <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
            {section.table && (
              <figure className="mt-4 overflow-x-auto">
                {section.table.caption && (
                  <figcaption className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">{section.table.caption}</figcaption>
                )}
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {section.table.headers.map((header) => (
                        <th key={header} className="border-b border-slate-300 px-3 py-2 font-bold dark:border-slate-700">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell, index) => (
                          <td key={index} className="border-b border-slate-200 px-3 py-2 align-top text-slate-600 dark:border-slate-800 dark:text-slate-300">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>
            )}
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
