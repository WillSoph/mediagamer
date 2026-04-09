"use client";

import { useMemo, useState } from "react";
import { formatScore } from "@/utils/formatScore";

type Platform = {
  id: string;
  name: string;
  slug: string;
};

type ReviewItem = {
  id: string;
  source_url: string;
  source_title: string;
  author_name: string | null;
  published_at: string | null;
  platform: string | null;
  score_original: number | null;
  score_scale: number | null;
  score_normalized: number | null;
  excerpt: string | null;
  verdict: string | null;
  publisher:
    | {
        id: string;
        name: string;
        slug: string;
        trust_weight?: number;
      }
    | {
        id: string;
        name: string;
        slug: string;
        trust_weight?: number;
      }[]
    | null;
};

type GameHeaderData = {
  title: string;
  release_date: string | null;
  review_count: number;
  score_weighted: number | null;
  developerName: string | null;
  publisherName: string | null;
  coverUrl: string | null;
};

type Props = {
  game: GameHeaderData;
  allPlatforms: Platform[];
  linkedPlatformSlugs: string[];
  reviews: ReviewItem[];
};

function normalizePlatform(value: string | null | undefined): string | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (
    normalized.includes("playstation 5") ||
    normalized === "ps5" ||
    normalized === "playstation5"
  ) {
    return "ps5";
  }

  if (
    normalized.includes("xbox") ||
    normalized.includes("series x") ||
    normalized.includes("series s")
  ) {
    return "xbox";
  }

  if (normalized === "pc" || normalized.includes("windows")) {
    return "pc";
  }

  if (
    normalized.includes("switch 2") ||
    normalized.includes("switch2") ||
    normalized.includes("nintendo switch 2")
  ) {
    return "switch2";
  }

  return normalized;
}

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

function getScoreBarClass(score: number | null) {
  if (score === null) return "bg-text-muted";
  if (score >= 75) return "bg-score-green";
  if (score >= 50) return "bg-score-yellow";
  return "bg-score-red";
}

function ScoreCircle({
  score,
  size = "lg",
}: {
  score: number | null;
  size?: "sm" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "h-24 w-24 text-3xl sm:h-28 sm:w-28 sm:text-4xl"
      : "h-14 w-14 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${getScoreCircleClass(
        score
      )}`}
    >
      {formatScore(score)}
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getPlatformShortLabel(slug: string) {
  switch (slug) {
    case "ps5":
      return "PS5";
    case "xbox":
      return "Xbox";
    case "pc":
      return "PC";
    case "switch2":
      return "Switch 2";
    default:
      return slug;
  }
}

function getPlatformIcon(slug: string) {
  switch (slug) {
    case "ps5":
      return "PS";
    case "xbox":
      return "XB";
    case "pc":
      return "PC";
    case "switch2":
      return "SW2";
    default:
      return slug.toUpperCase();
  }
}

function PlatformButton({
  platform,
  isActive,
  isLinked,
  onClick,
}: {
  platform: Platform;
  isActive: boolean;
  isLinked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isLinked}
      className={`group flex min-w-[92px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 transition ${
        !isLinked
          ? "cursor-not-allowed border-border bg-card/50 text-text-muted"
          : isActive
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-text-secondary hover:border-accent hover:text-text"
      }`}
      aria-pressed={isActive}
      title={platform.name}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-bold tracking-wide ${
          !isLinked
            ? "border-border bg-surface/60 text-text-muted"
            : isActive
            ? "border-primary/30 bg-primary/15 text-primary"
            : "border-border bg-surface text-text-secondary"
        }`}
      >
        {getPlatformIcon(platform.slug)}
      </div>

      <span className="text-center text-xs font-medium leading-tight">
        {getPlatformShortLabel(platform.slug)}
      </span>
    </button>
  );
}

export default function GameDetailsClient({
  game,
  allPlatforms,
  linkedPlatformSlugs,
  reviews,
}: Props) {
  const defaultPlatform =
    linkedPlatformSlugs.find((slug) =>
      reviews.some((review) => normalizePlatform(review.platform) === slug)
    ) ?? linkedPlatformSlugs[0] ?? null;

  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    if (!activePlatform) return reviews;

    return reviews.filter(
      (review) => normalizePlatform(review.platform) === activePlatform
    );
  }, [activePlatform, reviews]);

  const platformScore = useMemo(() => {
    if (filteredReviews.length === 0 || !activePlatform) return null;

    const weightedReviews = filteredReviews
      .map((review) => {
        const publisher = Array.isArray(review.publisher)
          ? review.publisher[0]
          : review.publisher;

        const score = review.score_normalized;
        const weight = publisher?.trust_weight ?? 1;

        if (typeof score !== "number") return null;

        return { score, weight };
      })
      .filter(
        (item): item is { score: number; weight: number } =>
          item !== null && typeof item.weight === "number"
      );

    if (weightedReviews.length === 0) return null;

    const totalWeight = weightedReviews.reduce(
      (acc, item) => acc + item.weight,
      0
    );

    if (totalWeight === 0) return null;

    const weightedSum = weightedReviews.reduce(
      (acc, item) => acc + item.score * item.weight,
      0
    );

    return weightedSum / totalWeight;
  }, [activePlatform, filteredReviews]);

  const activePlatformData = allPlatforms.find(
    (platform) => platform.slug === activePlatform
  );

  console.log("DEBUG game.score_weighted:", game.score_weighted);
console.log("DEBUG defaultPlatform:", defaultPlatform);
console.log("DEBUG activePlatform:", activePlatform);
console.log("DEBUG filteredReviews:", filteredReviews.length);
console.log(
  "DEBUG filtered review scores:",
  filteredReviews.map((review) => review.score_normalized)
);
console.log("DEBUG platformScore:", platformScore);
console.log(
  "DEBUG score shown in circle:",
  activePlatform ? platformScore : game.score_weighted
);

  const currentScore = activePlatform ? platformScore : game.score_weighted;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
              <div className="h-[240px] overflow-hidden rounded-3xl bg-surface ring-1 ring-white/5 sm:h-[280px]">
                {game.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-3 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary">
                      game
                    </p>

                    <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
                      {game.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {allPlatforms.map((platform) => (
                        <PlatformButton
                          key={platform.id}
                          platform={platform}
                          isLinked={linkedPlatformSlugs.includes(platform.slug)}
                          isActive={activePlatform === platform.slug}
                          onClick={() => {
                            if (!linkedPlatformSlugs.includes(platform.slug)) {
                              return;
                            }
                            setActivePlatform(platform.slug);
                          }}
                        />
                      ))}
                    </div>

                    <p className="mt-4 text-sm text-text-secondary">
                      {activePlatformData
                        ? `Exibindo nota e reviews de ${activePlatformData.name}`
                        : "Exibindo nota geral do jogo"}
                    </p>
                  </div>

                  <ScoreCircle score={currentScore} size="lg" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-bg/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                      Lançamento
                    </p>
                    <p className="mt-2 text-sm font-medium text-text">
                      {formatDate(game.release_date)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-bg/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                      Developer
                    </p>
                    <p className="mt-2 text-sm font-medium text-text">
                      {game.developerName ?? "Não informado"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-bg/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                      Publisher
                    </p>
                    <p className="mt-2 text-sm font-medium text-text">
                      {game.publisherName ?? "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-bg/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                      {activePlatformData
                        ? `Nota em ${activePlatformData.name}`
                        : "Nota agregada"}
                    </p>
                    <p className="text-sm font-semibold text-text-secondary">
                      {formatScore(currentScore)}
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className={`h-full rounded-full ${getScoreBarClass(
                        currentScore
                      )}`}
                      style={{
                        width: `${Math.max(
                          8,
                          Math.min(currentScore ?? 8, 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              Resumo
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Agora você pode alternar entre as plataformas vinculadas ao jogo
              para ver a nota e as reviews correspondentes.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-bg/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                  Plataforma ativa
                </p>
                <p className="mt-2 text-sm text-text">
                  {activePlatformData?.name ?? "Nenhuma plataforma selecionada"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-bg/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                  Reviews desta plataforma
                </p>
                <p className="mt-2 text-sm text-text">
                  {filteredReviews.length}{" "}
                  {filteredReviews.length === 1
                    ? "review encontrada"
                    : "reviews encontradas"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Reviews
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {activePlatformData
                  ? `Reviews filtradas por ${activePlatformData.name}`
                  : "Reviews aprovadas associadas a este jogo"}
              </p>
            </div>

            <span className="w-fit rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-secondary">
              {filteredReviews.length}{" "}
              {filteredReviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-bg/50 p-6 text-sm text-text-secondary">
              Não há reviews para esta plataforma no momento.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredReviews.map((review) => {
                const publisher = Array.isArray(review.publisher)
                  ? review.publisher[0]
                  : review.publisher;

                return (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-border/80 bg-bg/70 p-5 transition hover:border-accent/50"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-display text-xl font-semibold text-text">
                          {review.source_title}
                        </h3>

                        <p className="mt-2 text-sm text-text-secondary">
                          Fonte: {publisher?.name ?? "Desconhecida"}
                        </p>
                      </div>

                      <ScoreCircle score={review.score_normalized} size="sm" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-card/60 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                          Autor
                        </p>
                        <p className="mt-2 text-sm text-text">
                          {review.author_name ?? "Não informado"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-card/60 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                          Plataforma
                        </p>
                        <p className="mt-2 text-sm text-text">
                          {review.platform ?? "Não informada"}
                        </p>
                      </div>
                    </div>

                    {review.excerpt && (
                      <p className="mt-4 text-sm leading-7 text-text-secondary">
                        {review.excerpt}
                      </p>
                    )}

                    {review.verdict && (
                      <div className="mt-4 rounded-2xl border border-border bg-card/50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                          Veredito
                        </p>
                        <p className="mt-2 text-sm leading-7 text-text">
                          {review.verdict}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface">
                      <div
                        className={`h-full rounded-full ${getScoreBarClass(
                          review.score_normalized
                        )}`}
                        style={{
                          width: `${Math.max(
                            8,
                            Math.min(review.score_normalized ?? 8, 100)
                          )}%`,
                        }}
                      />
                    </div>

                    <a
                      href={review.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-text"
                    >
                      Ler review original
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}