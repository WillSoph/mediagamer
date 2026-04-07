"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import LatestGamesCarousel from "@/components/home/LatestGamesCarousel";
import UpcomingReleasesCarousel from "./UpcomingReleasesCarousel";
import Image from "next/image";

export type Game = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  release_date: string | null;
  review_count: number;
  score_average: number | null;
  score_weighted: number | null;
  created_at: string;
  updated_at: string;
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
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getScoreCircleClass(
        score
      )}`}
    >
      {score ?? "--"}
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

type HomeClientProps = {
  latestGames: Game[];
  upcomingGames: Game[];
};

export default function HomeClient({
  latestGames,
  upcomingGames,
}: HomeClientProps) {
  const [search, setSearch] = useState("");

  const trimmedSearch = search.trim().toLowerCase();

  const searchableGames = useMemo(() => {
    const map = new Map<string, Game>();

    [...latestGames, ...upcomingGames].forEach((game) => {
      map.set(game.id, game);
    });

    return Array.from(map.values());
  }, [latestGames, upcomingGames]);

  const filteredGames = useMemo(() => {
    if (!trimmedSearch) return [];

    return searchableGames.filter((game) => {
      const title = game.title.toLowerCase();
      const slug = game.slug.toLowerCase();

      return title.includes(trimmedSearch) || slug.includes(trimmedSearch);
    });
  }, [searchableGames, trimmedSearch]);

  const showSearchResults = trimmedSearch.length > 0;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex items-center">
                <Image
                  src="/logo/media-gamer-logo-site-2.png"
                  alt="MediaGamer"
                  width={151}
                  height={46}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex w-full min-w-0 items-center gap-3 rounded-full border border-border bg-card px-4 py-3 lg:w-[360px]">
                <span className="text-text-muted">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar jogos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {showSearchResults && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/80 bg-card/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                  Resultados da busca
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {filteredGames.length}{" "}
                  {filteredGames.length === 1
                    ? "jogo encontrado"
                    : "jogos encontrados"}{" "}
                  para <span className="text-text">{search}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="w-fit rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-text"
              >
                Limpar busca
              </button>
            </div>

            {filteredGames.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg/50 p-6 text-sm text-text-secondary">
                Nenhum jogo encontrado para essa busca.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/jogos/${game.slug}`}
                    className="group rounded-3xl border border-border/80 bg-bg/70 p-5 transition hover:border-accent/50 hover:bg-bg"
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

                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="mb-2 inline-flex rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          game
                        </p>

                        <h3 className="line-clamp-2 font-display text-xl font-semibold text-text">
                          {game.title}
                        </h3>

                        <p className="mt-2 text-sm text-text-secondary">
                          {formatDate(game.release_date)}
                        </p>
                      </div>

                      <ScoreCircle score={game.score_weighted} />
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-surface">
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
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-card/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
          <LatestGamesCarousel games={latestGames} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-card/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
          <UpcomingReleasesCarousel games={upcomingGames} />
        </div>
      </section>
    </>
  );
}