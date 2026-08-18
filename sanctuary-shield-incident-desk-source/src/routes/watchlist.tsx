import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { IncidentRow } from "@/components/incident-row";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getWatchlist } from "@/lib/incidents-server";
import type { Incident } from "@/lib/incidents";

export const Route = createFileRoute("/watchlist")({
  component: WatchlistPage,
});

function WatchlistPage() {
  const { user, isPending } = useCurrentUserState();
  const [items, setItems] = useState<Incident[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems(null);
      return;
    }
    let cancelled = false;
    getWatchlist()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your watchlist.");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-elevated" />
        <div className="h-48 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  if (!user) return <RedirectToSignIn />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-subtle">Watchlist</p>
        <h1 className="font-display text-3xl tracking-tight text-fg">Your saved filings</h1>
        <p className="max-w-2xl text-muted">
          Private to your account. Bookmark any incident from its file to keep it here.
        </p>
      </header>

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      {items === null && !error ? (
        <div className="h-48 animate-pulse rounded-xl bg-surface" />
      ) : items && items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-xl bg-surface p-8 shadow-[var(--shadow-border)]">
          <Bookmark className="size-6 text-subtle" />
          <div>
            <h2 className="font-display text-xl text-fg">Nothing on the list yet</h2>
            <p className="mt-1 max-w-md text-sm text-muted">
              Open an incident and choose Watch this to pin it here.
            </p>
          </div>
          <Button asChild>
            <Link to="/incidents">Browse incidents</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]">
          {items?.map((inc) => (
            <IncidentRow key={inc.id} incident={inc} />
          ))}
        </div>
      )}
    </div>
  );
}
