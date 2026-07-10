import { createContext, useContext, type ReactNode } from "react";

/** 探索器主畫面 UI 共用狀態（搜尋列 / 結果區），避免 props 爆炸。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExplorerUiBag = Record<string, any>;

const ExplorerUiContext = createContext<ExplorerUiBag | null>(null);

export function ExplorerUiProvider({
  value,
  children,
}: {
  value: ExplorerUiBag;
  children: ReactNode;
}) {
  return <ExplorerUiContext.Provider value={value}>{children}</ExplorerUiContext.Provider>;
}

export function useExplorerUi(): ExplorerUiBag {
  const v = useContext(ExplorerUiContext);
  if (!v) throw new Error("useExplorerUi must be used within ExplorerUiProvider");
  return v;
}
