import fs from "fs";

const detailRaw = fs.readFileSync("tmp-detail-raw.txt", "utf8").replace(/\r\n/g, "\n");
const trendRaw = fs.readFileSync("tmp-trend-raw.txt", "utf8").replace(/\r\n/g, "\n");

// --- TrendDistrictDialog ---
let trendInner = trendRaw
  .replace(/^\s*\{\/\* District Volume Trend Dialog \*\/\}\s*\n/, "")
  .replace(
    /onOpenChange=\{\(open\) => !open && setTrendDistrict\(null\)\}/,
    "onOpenChange={(open) => !open && onClose()}"
  );

const trendFile = `import React from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "../../types/real-estate";
import { getLatestThreeMonthsForDistrict } from "../../utils/real-estate-helpers";

type Props = {
  trendDistrict: string | null;
  onClose: () => void;
  data: Transaction[];
};

export function TrendDistrictDialog({ trendDistrict, onClose, data }: Props) {
  return (
    <>
${trendInner}
    </>
  );
}
`;

fs.writeFileSync("src/components/explorer/TrendDistrictDialog.tsx", trendFile);
console.log("Wrote TrendDistrictDialog");

// --- TransactionDetailDialog ---
let detailInner = detailRaw
  .replace(/^\s*\{\/\* Detail Dialog \*\/\}\s*\n/, "")
  .replace(
    /onOpenChange=\{\(open\) => !open && setSelectedItem\(null\)\}/g,
    "onOpenChange={(open) => !open && onClose()}"
  )
  .replace(/setSelectedItem\(null\)/g, "onClose()")
  .replace(/setMortgageLtv/g, "onMortgageLtvChange")
  .replace(/setMortgageYears/g, "onMortgageYearsChange")
  .replace(/setMortgageRate/g, "onMortgageRateChange")
  .replace(/setDetailShowTopMask/g, "onDetailShowTopMask")
  .replace(/setDetailShowBottomMask/g, "onDetailShowBottomMask")
  .replace(/setFocusBuildCase/g, "onFocusBuildCase");

const detailFile = `import React, { Suspense, lazy, type RefObject } from "react";
import { motion } from "motion/react";
import {
  X,
  Home,
  Car,
  Calendar,
  MapPin,
  DollarSign,
  Maximize2,
  Layers,
  Clock,
  Map as MapIcon,
  MapPinOff,
  Building2,
  Bed,
  Sofa,
  Bath,
  Crosshair,
  GitCompare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "../../types/real-estate";
import {
  formatPrice,
  formatDate,
  getSpecialTags,
  estimateMortgageMonthly,
} from "../../utils/real-estate-helpers";
import { DetailRow } from "../DetailRow";
import { AffiliateChips } from "../AffiliateMarquee";
import { MortgageCalculatorCta } from "../AffiliateSlot";
import { modalContainerVariants, modalItemVariants } from "../../constants/app-ui";

const CommunityTrendChart = lazy(() => import("../CommunityTrendChart"));
const TransactionMapPreview = lazy(() =>
  import("../MapViews").then((m) => ({ default: m.TransactionMapPreview }))
);

export type CommunityChartPoint = {
  date: string;
  unitPrice: number;
  totalPrice: number;
  address?: string;
  isCurrent?: boolean;
  id?: string;
  [key: string]: unknown;
};

type Props = {
  selectedItem: Transaction | null;
  onClose: () => void;
  cityName: string;
  typeName: string;
  buildingImages: string[];
  isBuildingImagesLoading: boolean;
  imageSliderRef: RefObject<HTMLDivElement | null>;
  detailShowTopMask: boolean;
  detailShowBottomMask: boolean;
  onDetailShowTopMask: (v: boolean) => void;
  onDetailShowBottomMask: (v: boolean) => void;
  communityItems: Transaction[];
  communityChartData: CommunityChartPoint[];
  mortgageLtv: number;
  mortgageYears: number;
  mortgageRate: number;
  onMortgageLtvChange: (v: number) => void;
  onMortgageYearsChange: (v: number) => void;
  onMortgageRateChange: (v: number) => void;
  compareList: Transaction[];
  toggleCompare: (item: Transaction, e: React.MouseEvent) => void;
  setNearbyFromItem: (item: Transaction) => void;
  focusBuildCase: string | null;
  onFocusBuildCase: (v: string | null | ((prev: string | null) => string | null)) => void;
};

export function TransactionDetailDialog({
  selectedItem,
  onClose,
  cityName,
  typeName,
  buildingImages,
  isBuildingImagesLoading,
  imageSliderRef,
  detailShowTopMask,
  detailShowBottomMask,
  onDetailShowTopMask,
  onDetailShowBottomMask,
  communityItems,
  communityChartData,
  mortgageLtv,
  mortgageYears,
  mortgageRate,
  onMortgageLtvChange,
  onMortgageYearsChange,
  onMortgageRateChange,
  compareList,
  toggleCompare,
  setNearbyFromItem,
  focusBuildCase,
  onFocusBuildCase,
}: Props) {
  return (
    <>
${detailInner}
    </>
  );
}
`;

fs.writeFileSync("src/components/explorer/TransactionDetailDialog.tsx", detailFile);
console.log("Wrote TransactionDetailDialog");
