import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getNote, saveNote } from "@/lib/incidents-server";

export function AnalystNote({ incidentId }: { incidentId: string }) {
  const { user } = useCurrentUserState();
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setBody("");
      setLoaded(false);
      return;
    }
    let cancelled = false;
    getNote({ data: incidentId })
      .then((text) => {
        if (!cancelled) {
          setBody(text);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, incidentId]);

  if (!user) {
    return (
      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg text-fg">Private notes</h2>
        <p className="mt-1 text-sm text-muted">
          Sign in to keep a private analyst note on this filing. Notes stay on your
          account and are never published.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
      onSubmit={(e) => {
        e.preventDefault();
        setSaving(true);
        void saveNote({ data: { incidentId, body } })
          .then(() => toast("Note saved"))
          .catch(() => toast.error("Could not save note"))
          .finally(() => setSaving(false));
      }}
    >
      <h2 className="font-display text-lg text-fg">Private notes</h2>
      <p className="mt-1 text-sm text-muted">Only you can see this. It is not part of the public desk.</p>
      <Textarea
        className="mt-3"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a private note…"
        disabled={!loaded}
      />
      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" disabled={saving || !loaded}>
          {saving ? "Saving…" : "Save note"}
        </Button>
      </div>
    </form>
  );
}
