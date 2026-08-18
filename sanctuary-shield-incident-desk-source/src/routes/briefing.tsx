import { createFileRoute } from "@tanstack/react-router";
import { WWL_2026 } from "@/lib/incidents";
import { formatCompact } from "@/lib/format";

export const Route = createFileRoute("/briefing")({
  component: Briefing,
});

function Briefing() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-subtle">Briefing</p>
        <h1 className="font-display text-3xl tracking-tight text-fg">How to read this desk</h1>
      </header>

      <section className="space-y-3 text-base leading-relaxed text-muted">
        <p className="text-fg">
          Sanctuary Shield keeps this incident desk so church leaders can see
          documented attacks on sanctuaries — parish churches, cathedrals,
          monasteries, and church-run campuses. It is a curated record, not a live
          intelligence feed and not a complete count of anti-Christian persecution.
        </p>
        <p>
          Each filing is a public-record event with a date, a place, a conservative
          casualty figure, and a named source. Campaign entries (a season of arson,
          a wave of demolitions) are labeled as such so they are not mistaken for a
          single night’s attack.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-fg">What is in — and out</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
          <li>In: attacks, arson, raids, vandalism, and conflict strikes on church sites.</li>
          <li>In: Western cases (Charleston, Sutherland Springs, Nice) alongside Nigeria, Pakistan, Egypt, Syria.</li>
          <li>Out: general crime next to a church, theological controversy, and unsourced social posts.</li>
          <li>Out: every killing of a Christian. Open Doors counts those separately.</li>
        </ul>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl text-fg">Open Doors WWL 2026</h2>
        <p className="mt-2 text-sm text-muted">
          Independent of this ledger. Quoted so the desk is not mistaken for the
          whole field.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">Killed</dt>
            <dd className="font-display text-2xl tabular-nums text-fg">
              {formatCompact(WWL_2026.killed)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">In Nigeria</dt>
            <dd className="font-display text-2xl tabular-nums text-fg">
              {formatCompact(WWL_2026.nigeriaShareKilled)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">
              Churches attacked
            </dt>
            <dd className="font-display text-2xl tabular-nums text-fg">
              {formatCompact(WWL_2026.churchesAttacked)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">
              Facing persecution
            </dt>
            <dd className="font-display text-2xl tabular-nums text-fg">
              {WWL_2026.facingPersecutionMillions}m
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="font-display text-2xl text-fg">Sources</h2>
        <p className="mt-3 text-muted">
          Incident files cite contemporaneous reporting (Reuters, BBC, AP),
          court and government statements, and monitors including Open Doors, Aid
          to the Church in Need, OIDAC Europe, Human Rights Watch, and the Syrian
          Network for Human Rights. Casualty numbers prefer the lower widely
          reported figure when sources disagree.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-fg">Accounts</h2>
        <p className="mt-3 text-muted">
          The desk is public. Sign in to keep a private watchlist and analyst
          notes. Notes are stored on your account and are not published.
        </p>
      </section>

      <blockquote className="border-l-2 border-gold pl-4 text-muted">
        <p className="font-display italic text-fg">
          We prayed to our God and posted a guard.
        </p>
        <footer className="mt-2 text-xs uppercase tracking-[0.14em] text-subtle">
          Nehemiah 4:9
        </footer>
      </blockquote>
    </article>
  );
}
