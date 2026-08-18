import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getWatchIds, toggleWatch } from "@/lib/incidents-server";
import { cn } from "@/lib/utils";

export function WatchButton({ incidentId }: { incidentId: string }) {
  const { user } = useCurrentUserState();
  const [watching, setWatching] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setWatching(false);
      return;
    }
    let cancelled = false;
    getWatchIds()
      .then((ids) => {
        if (!cancelled) setWatching(ids.includes(incidentId));
      })
      .catch(() => {
        if (!cancelled) setWatching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, incidentId]);

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link to="/login">Sign in to watch</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={watching ? "default" : "outline"}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void toggleWatch({ data: incidentId })
          .then((res) => {
            setWatching(res.watching);
            toast(res.watching ? "Added to watchlist" : "Removed from watchlist");
          })
          .catch(() => toast.error("Could not update watchlist. Sign in again?"))
          .finally(() => setBusy(false));
      }}
    >
      <Bookmark className={cn("size-4", watching && "fill-current")} />
      {watching ? "Watching" : "Watch this"}
    </Button>
  );
}
