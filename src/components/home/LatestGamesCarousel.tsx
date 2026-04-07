"use client";

import Link from "next/link";
import { useRef } from "react";

type Game = {
  id: string;
  title: string;
  slug: string;
  release_date: string | null;
  score_weighted: number | null;
  cover_url?: string | null;
};

function getScoreCircleClass(score: number | null) {
  if (score === null) {
    return "border border-border bg-surface text-text-secondary";
  }

  if (score >= 75) {
    return "border border-score-green/30 bg-score-green/15 text-score-green";
  }

  if (score >= 50) {
    return "border border-score-yellow/30 bg-score-yellow/15 text-score-yellow";
  }

  return "border border-score-red/30 bg-score-red/15 text-score-red";
}

function ScoreCircle({ score }: { score: number | null }) {
  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold ${getScoreCircleClass(
        score
      )}`}
    >
      {score ?? "--"}
    </div>
  );
}

function formatReleaseDate(date: string | null) {
  if (!date) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default function LatestGamesCarousel({ games }: { games: Game[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const amount = container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Últimos jogos
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Os títulos mais recentes adicionados ao catálogo.
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:border-accent hover:text-text"
            aria-label="Voltar"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:border-accent hover:text-text"
            aria-label="Avançar"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/jogos/${game.slug}`}
            className="min-w-[280px] max-w-[280px] snap-start rounded-3xl border border-border/80 bg-bg/70 p-4 transition hover:border-accent/50 hover:bg-bg sm:min-w-[320px] sm:max-w-[320px]"
          >
            <div className="mb-4 h-40 overflow-hidden rounded-2xl bg-surface ring-1 ring-white/5">
              {game.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={game.cover_url}
                  alt={game.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-2 inline-flex rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                  game
                </p>

                <h3 className="line-clamp-2 font-display text-xl font-semibold text-text">
                  {game.title}
                </h3>

                <p className="mt-2 text-sm text-text-secondary">
                  {formatReleaseDate(game.release_date)}
                </p>
              </div>

              <ScoreCircle score={game.score_weighted} />
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface">
              <div
                className={`h-full rounded-full ${
                  game.score_weighted === null
                    ? "bg-text-muted"
                    : game.score_weighted >= 75
                    ? "bg-score-green"
                    : game.score_weighted >= 50
                    ? "bg-score-yellow"
                    : "bg-score-red"
                }`}
                style={{
                  width: `${Math.max(
                    8,
                    Math.min(game.score_weighted ?? 8, 100)
                  )}%`,
                }}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:border-accent hover:text-text"
          aria-label="Voltar"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:border-accent hover:text-text"
          aria-label="Avançar"
        >
          →
        </button>
      </div>
    </section>
  );
}