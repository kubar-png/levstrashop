'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Polls /api/order-status?refId=... every 3s while the order is still
 * pending. Stops once we hit a terminal state (paid/failed/cancelled)
 * and triggers a server-component refresh so the page renders the new
 * status.
 */
export function OrderStatusPoller({ refId }: { refId: string }) {
  const router = useRouter();
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetch(`/api/order-status?refId=${encodeURIComponent(refId)}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('status fetch failed');
        const data = (await res.json()) as { status: string | null };
        if (cancelled) return;
        if (data.status && data.status !== 'pending') {
          router.refresh();
          return;
        }
      } catch {
        /* ignore — try again */
      }
      /* Give up after 3 minutes so the page doesn't ping forever. */
      if (Date.now() - startedAt.current > 3 * 60 * 1000) return;
      timer = setTimeout(tick, 3000);
    }

    timer = setTimeout(tick, 2500);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [refId, router]);

  return (
    <p
      className="font-poppins-regular mt-6 inline-flex items-center gap-2"
      style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
    >
      <span
        className="inline-block h-2 w-2 animate-pulse rounded-full"
        style={{ background: 'var(--color-forest)' }}
      />
      Ověřujeme platbu…
    </p>
  );
}
