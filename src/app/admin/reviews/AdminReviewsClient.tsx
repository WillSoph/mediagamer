"use client";

import { useEffect, useMemo, useState } from "react";
import { createReview, updateReview } from "./actions";

type Game = {
  id: string;
  title: string;
  slug: string;
};

type ReviewSource = {
  id: string;
  name: string;
  slug: string;
};

type Platform = {
  id: string;
  name: string;
  slug: string;
};

type Review = {
  id: string;
  game_id: string;
  publisher_id: string;
  source_title: string;
  source_url: string;
  author_name: string | null;
  platform: string | null;
  score_original: number | null;
  score_scale: number | null;
  score_normalized: number | null;
  excerpt: string | null;
  verdict: string | null;
  status: string;
  published_at: string | null;
  game:
    | {
        title: string;
        slug: string;
      }
    | {
        title: string;
        slug: string;
      }[]
    | null;
  publisher:
    | {
        name: string;
        slug: string;
      }
    | {
        name: string;
        slug: string;
      }[]
    | null;
};

type Props = {
  games: Game[];
  publishers: ReviewSource[];
  platforms: Platform[];
  reviews: Review[];
};

function getScoreCircleClass(score: number | null) {
  if (score === null) {
    return "bg-slate-800 text-slate-300 border border-slate-700";
  }

  if (score >= 75) {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  }

  if (score >= 50) {
    return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
  }

  return "bg-red-500/15 text-red-300 border border-red-500/30";
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
  if (!date) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

const inputClass =
  "w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10";

export default function AdminReviewsClient({
  games,
  publishers,
  platforms,
  reviews,
}: Props) {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const [gameIdValue, setGameIdValue] = useState("");
  const [publisherIdValue, setPublisherIdValue] = useState("");
  const [platformValue, setPlatformValue] = useState("");
  const [sourceTitleValue, setSourceTitleValue] = useState("");
  const [sourceUrlValue, setSourceUrlValue] = useState("");
  const [authorNameValue, setAuthorNameValue] = useState("");
  const [publishedAtValue, setPublishedAtValue] = useState("");
  const [scoreOriginalValue, setScoreOriginalValue] = useState("");
  const [scoreScaleValue, setScoreScaleValue] = useState("");
  const [excerptValue, setExcerptValue] = useState("");
  const [verdictValue, setVerdictValue] = useState("");
  const [statusValue, setStatusValue] = useState("approved");


  function resetForm() {
    setEditingReviewId(null);
    setGameIdValue("");
    setPublisherIdValue("");
    setPlatformValue("");
    setSourceTitleValue("");
    setSourceUrlValue("");
    setAuthorNameValue("");
    setPublishedAtValue("");
    setScoreOriginalValue("");
    setScoreScaleValue("");
    setExcerptValue("");
    setVerdictValue("");
    setStatusValue("approved");
  }

  function handleEditReview(review: Review) {
    setEditingReviewId(review.id);
    setGameIdValue(review.game_id ?? "");
    setPublisherIdValue(review.publisher_id ?? "");
    setPlatformValue(review.platform ?? "");
    setSourceTitleValue(review.source_title ?? "");
    setSourceUrlValue(review.source_url ?? "");
    setAuthorNameValue(review.author_name ?? "");
    setPublishedAtValue(
        review.published_at
        ? new Date(review.published_at).toISOString().slice(0, 10)
        : ""
    );
    setScoreOriginalValue(
        review.score_original !== null && review.score_original !== undefined
        ? String(review.score_original)
        : ""
    );
    setScoreScaleValue(
        review.score_scale !== null && review.score_scale !== undefined
        ? String(review.score_scale)
        : ""
    );
    setExcerptValue(review.excerpt ?? "");
    setVerdictValue(review.verdict ?? "");
    setStatusValue(review.status ?? "approved");
    }

  const formAction = editingReviewId ? updateReview : createReview;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Admin · Reviews
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Cadastre reviews manualmente com seleção de jogo, fonte e plataforma.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {editingReviewId ? "Editar review" : "Nova review"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {editingReviewId
                    ? "Atualize os dados da análise selecionada."
                    : "Preencha os dados da análise manualmente."}
                </p>
              </div>

              {editingReviewId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  Cancelar
                </button>
              )}
            </div>

            <form action={formAction} className="space-y-4">
              {editingReviewId && (
                <input type="hidden" name="review_id" value={editingReviewId} />
              )}

              <div>
                <label
                  htmlFor="game_id"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Jogo *
                </label>
                <select
                  id="game_id"
                  name="game_id"
                  value={gameIdValue}
                  onChange={(e) => setGameIdValue(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Selecione um jogo</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="publisher_id"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Fonte de review *
                </label>
                <select
                  id="publisher_id"
                  name="publisher_id"
                  value={publisherIdValue}
                  onChange={(e) => setPublisherIdValue(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Selecione uma fonte</option>
                  {publishers.map((publisher) => (
                    <option key={publisher.id} value={publisher.id}>
                      {publisher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="platform"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Plataforma
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={platformValue}
                  onChange={(e) => setPlatformValue(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecione uma plataforma</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.slug}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="source_title"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Título da review *
                </label>
                <input
                  id="source_title"
                  name="source_title"
                  type="text"
                  required
                  placeholder="Ex: Review: Elden Ring impressiona..."
                  className={inputClass}
                  value={sourceTitleValue}
                  onChange={(e) => setSourceTitleValue(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="source_url"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  URL da review *
                </label>
                <input
                  id="source_url"
                  name="source_url"
                  type="url"
                  required
                  placeholder="https://..."
                  className={inputClass}
                  value={sourceUrlValue}
                  onChange={(e) => setSourceUrlValue(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="author_name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Autor
                </label>
                <input
                  id="author_name"
                  name="author_name"
                  type="text"
                  placeholder="Ex: João Silva"
                  className={inputClass}
                  value={authorNameValue}
                  onChange={(e) => setAuthorNameValue(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="published_at"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Data de publicação
                </label>
                <input
                  id="published_at"
                  name="published_at"
                  type="date"
                  className={inputClass}
                  value={publishedAtValue}
                  onChange={(e) => setPublishedAtValue(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="score_original"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Nota original
                  </label>
                  <input
                    id="score_original"
                    name="score_original"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 9.5"
                    className={inputClass}
                    value={scoreOriginalValue}
                    onChange={(e) => setScoreOriginalValue(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="score_scale"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Escala da nota
                  </label>
                  <input
                    id="score_scale"
                    name="score_scale"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10"
                    className={inputClass}
                    value={scoreScaleValue}
                    onChange={(e) => setScoreScaleValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="excerpt"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Resumo curto
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={4}
                  placeholder="Resumo da análise..."
                  className={`${inputClass} resize-none`}
                  value={excerptValue}
                  onChange={(e) => setExcerptValue(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="verdict"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Veredito
                </label>
                <textarea
                  id="verdict"
                  name="verdict"
                  rows={4}
                  placeholder="Conclusão da review..."
                  className={`${inputClass} resize-none`}
                  value={verdictValue}
                  onChange={(e) => setVerdictValue(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.99]"
              >
                {editingReviewId ? "Salvar alterações" : "Salvar review"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Reviews cadastradas
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Últimas reviews inseridas no sistema.
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-slate-300">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
                Nenhuma review cadastrada ainda.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {reviews.map((review) => {
                  const game = Array.isArray(review.game)
                    ? review.game[0]
                    : review.game;

                  const publisher = Array.isArray(review.publisher)
                    ? review.publisher[0]
                    : review.publisher;

                  return (
                    <article
                      key={review.id}
                      className="relative rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 transition hover:border-slate-700"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-lg font-semibold text-white">
                            {review.source_title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {game?.title ?? "Jogo não encontrado"}
                          </p>
                        </div>

                        <ScoreCircle score={review.score_normalized} />
                      </div>

                      <dl className="space-y-2 text-sm">
                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Fonte</dt>
                          <dd className="text-slate-200">
                            {publisher?.name ?? "Não informado"}
                          </dd>
                        </div>

                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Plataforma</dt>
                          <dd className="text-slate-200">
                            {review.platform ?? "Não informada"}
                          </dd>
                        </div>

                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Autor</dt>
                          <dd className="text-slate-200">
                            {review.author_name ?? "Não informado"}
                          </dd>
                        </div>

                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Publicação</dt>
                          <dd className="text-slate-200">
                            {formatDate(review.published_at)}
                          </dd>
                        </div>

                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Status</dt>
                          <dd className="text-slate-200">{review.status}</dd>
                        </div>
                      </dl>

                      <div className="mt-5 flex items-center gap-3">
                        <a
                          href={review.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                        >
                          Abrir review
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEditReview(review)}
                        className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                        title="Editar review"
                        aria-label={`Editar ${review.source_title}`}
                      >
                        ✎
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}