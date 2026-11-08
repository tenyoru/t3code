import { useEffect, useState } from "react";

import { useStableCallback } from "~/hooks/useStableCallback";
import { observeIntersection } from "~/lib/observeIntersection";

export function DiffFileLoadingBoundary({ load, count }: { load: () => void; count: number }) {
  const [isNear, setIsNear] = useState(false);
  const loadLatest = useStableCallback(load);
  // A fresh observe redelivers the current intersection, so this ref must keep its identity
  // across renders: it captures nothing but the state setter.
  const observe = (node: HTMLDivElement | null) => {
    if (!node) return;
    return observeIntersection(node, (entry) => setIsNear(entry.isIntersecting), {
      rootMargin: "600px",
    });
  };
  // A settled batch shrinks `count` without moving the boundary out of range, and no new
  // intersection entry arrives for that, so ask for the next batch whenever it changes.
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- requests the next diff batch while the boundary is near the viewport and files remain
  useEffect(() => {
    if (isNear && count > 0) loadLatest();
  }, [isNear, count, loadLatest]);

  // Every remaining file already has a placeholder row above, so this only marks the list's end.
  return <div ref={observe} aria-hidden />;
}
