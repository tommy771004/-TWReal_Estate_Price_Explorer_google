// 聯盟／合作推廣資料：從 /api/affiliates 讀取，資料集中於共用 affiliates 資料表管理。
// 規格：docs/affiliate-integration-spec.md
import { useEffect, useRef, useState, type RefObject } from "react";

export type AffiliateOffer = {
  projectName: string;
  id: string;
  enabled: boolean;
  sponsored: boolean;
  title: string;
  description: string;
  ctaLabel: string;
  url: string;
  icon: string | null;
  categories: string[];
  crops: string[] | null;
  priority: number;
  partner: string | null;
};

/** 對外連結一律加上的 rel，符合 Google 對聯盟／合作連結的規範。 */
export const AFFILIATE_LINK_REL = "sponsored nofollow noopener";

function isSafeUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url) return false;
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

function isValidOffer(offer: any): offer is AffiliateOffer {
  return (
    offer &&
    typeof offer.id === "string" &&
    typeof offer.title === "string" &&
    typeof offer.ctaLabel === "string" &&
    Array.isArray(offer.categories) &&
    isSafeUrl(offer.url)
  );
}

let cachedOffers: AffiliateOffer[] | null = null;
let cacheExpiresAt = 0;
let inflightRequest: Promise<AffiliateOffer[]> | null = null;
const CACHE_TTL_MS = 60_000;

async function loadOffers(): Promise<AffiliateOffer[]> {
  if (cachedOffers && cacheExpiresAt > Date.now()) return cachedOffers;
  if (inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    try {
      const res = await fetch("/api/affiliates");
      if (!res.ok) return [];
      const json = await res.json();
      const offers: AffiliateOffer[] = Array.isArray(json?.offers) ? json.offers.filter(isValidOffer) : [];
      cachedOffers = offers;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return offers;
    } catch (error) {
      console.warn("[affiliates] 讀取推廣資料失敗，不顯示推廣區塊:", error);
      return [];
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

/** 讀取目前專案啟用中的聯盟推廣資料。失敗或未設定時回傳空陣列，不影響主功能。 */
export function useAffiliateOffers(): AffiliateOffer[] {
  const [offers, setOffers] = useState<AffiliateOffer[]>(cachedOffers ?? []);

  useEffect(() => {
    let alive = true;
    loadOffers().then((data) => {
      if (alive) setOffers(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return offers;
}

/** 篩選符合分類的推廣資料；category 未指定時回傳全部（見 spec 4.3 首頁跑馬燈規則）。 */
export function offersByCategory(offers: AffiliateOffer[], category?: string): AffiliateOffer[] {
  if (!category) return offers;
  return offers.filter((o) => o.categories.includes(category) || o.categories.includes("all"));
}

/** 曝光／點擊事件，寫入本站既有的 audit_logs（見 spec 7）。Fire-and-forget，不阻塞使用者操作。 */
export function trackAffiliateEvent(
  action: "affiliate_impression" | "affiliate_click",
  offer: AffiliateOffer,
  placement: string
) {
  const details = JSON.stringify({
    id: offer.id,
    project_name: offer.projectName,
    sponsored: offer.sponsored,
    partner: offer.partner ?? offer.title,
    placement,
  });
  fetch("/api/audit-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action_type: action, details }),
  }).catch(() => {});
}

/**
 * 曝光追蹤：觀察 containerRef 內帶有 data-affiliate-id 的元素，進入可視範圍時各檔位僅回報一次。
 * 用於跑馬燈／導購版位，元件卸載或 offers 變動時自動重新綁定。
 */
export function useAffiliateImpressionTracking(
  containerRef: RefObject<HTMLElement | null>,
  offers: AffiliateOffer[],
  placement: string
) {
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const root = containerRef.current;
    if (!root || offers.length === 0 || typeof IntersectionObserver === "undefined") return;

    const offerById = new Map(offers.map((o) => [o.id, o]));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.affiliateId;
          if (!id || seenRef.current.has(id)) continue;
          const offer = offerById.get(id);
          if (!offer) continue;
          seenRef.current.add(id);
          trackAffiliateEvent("affiliate_impression", offer, placement);
        }
      },
      { threshold: 0.5 }
    );

    const items = root.querySelectorAll<HTMLElement>("[data-affiliate-id]");
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef, offers, placement]);
}
