"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createDeveloper,
  createGame,
  createGamePublisher,
  createPublisher,
  updateGame,
  updateReviewSource,
  deleteGame,
} from "./actions";
import ImportGames from "@/components/admin/ImportGames";

type Publisher = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  trust_weight: number;
  review_scale_default: number | null;
};

type Developer = {
  id: string;
  name: string;
  slug: string;
};

type GamePublisher = {
  id: string;
  name: string;
  slug: string;
};

type Platform = {
  id: string;
  name: string;
  slug: string;
};

type GamePlatform = {
  game_id: string;
  platform_id: string;
};

type Game = {
  id: string;
  title: string;
  slug: string;
  release_date: string | null;
  developer_id: string | null;
  game_publisher_id: string | null;
  score_weighted: number | null;
};

type AdminTabsProps = {
  games: Game[];
  publishers: Publisher[];
  developers: Developer[];
  gamePublishers: GamePublisher[];
  platforms: Platform[];
  gamePlatforms: GamePlatform[];
};

type TabKey = "games" | "sources" | "developers" | "gamePublishers" | "import";

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

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-slate-300"
    >
      {children}
    </label>
  );
}

function InputClass() {
  return "w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10";
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export default function AdminTabs({
  games,
  publishers,
  developers,
  gamePublishers,
  platforms,
  gamePlatforms,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("games");

  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [releaseDateValue, setReleaseDateValue] = useState("");
  const [gamePublisherIdValue, setGamePublisherIdValue] = useState("");
  const [developerIdValue, setDeveloperIdValue] = useState("");
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([]);

  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [sourceNameValue, setSourceNameValue] = useState("");
  const [sourceSlugValue, setSourceSlugValue] = useState("");
  const [sourceWebsiteValue, setSourceWebsiteValue] = useState("");
  const [sourceTrustWeightValue, setSourceTrustWeightValue] = useState("1");
  const [sourceReviewScaleValue, setSourceReviewScaleValue] = useState("");

  const developerMap = useMemo(() => {
    return new Map(developers.map((developer) => [developer.id, developer]));
  }, [developers]);

  const gamePublisherMap = useMemo(() => {
    return new Map(gamePublishers.map((publisher) => [publisher.id, publisher]));
  }, [gamePublishers]);

  const platformMap = useMemo(() => {
    return new Map(platforms.map((platform) => [platform.id, platform]));
  }, [platforms]);

  const gamePlatformMap = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const relation of gamePlatforms) {
      const existing = map.get(relation.game_id) ?? [];
      existing.push(relation.platform_id);
      map.set(relation.game_id, existing);
    }

    return map;
  }, [gamePlatforms]);

  const editingGame = useMemo(
    () => games.find((game) => game.id === editingGameId) ?? null,
    [games, editingGameId]
  );

  const editingSource = useMemo(
    () => publishers.find((publisher) => publisher.id === editingSourceId) ?? null,
    [publishers, editingSourceId]
  );

  useEffect(() => {
    if (!editingGame) return;

    setTitleValue(editingGame.title);
    setSlugValue(editingGame.slug);
    setReleaseDateValue(editingGame.release_date ?? "");
    setGamePublisherIdValue(editingGame.game_publisher_id ?? "");
    setDeveloperIdValue(editingGame.developer_id ?? "");
    setSelectedPlatformIds(gamePlatformMap.get(editingGame.id) ?? []);
  }, [editingGame, gamePlatformMap]);

  useEffect(() => {
    if (!editingSource) return;

    setSourceNameValue(editingSource.name);
    setSourceSlugValue(editingSource.slug);
    setSourceWebsiteValue(editingSource.website_url ?? "");
    setSourceTrustWeightValue(String(editingSource.trust_weight ?? 1));
    setSourceReviewScaleValue(
      editingSource.review_scale_default !== null &&
        editingSource.review_scale_default !== undefined
        ? String(editingSource.review_scale_default)
        : ""
    );
  }, [editingSource]);

  function resetGameForm() {
    setEditingGameId(null);
    setTitleValue("");
    setSlugValue("");
    setReleaseDateValue("");
    setGamePublisherIdValue("");
    setDeveloperIdValue("");
    setSelectedPlatformIds([]);
  }

  function resetSourceForm() {
    setEditingSourceId(null);
    setSourceNameValue("");
    setSourceSlugValue("");
    setSourceWebsiteValue("");
    setSourceTrustWeightValue("1");
    setSourceReviewScaleValue("");
  }

  function handleEditGame(game: Game) {
    setEditingGameId(game.id);
    setActiveTab("games");
  }

  function handleEditSource(source: Publisher) {
    setEditingSourceId(source.id);
    setActiveTab("sources");
  }

  function togglePlatform(platformId: string) {
    setSelectedPlatformIds((current) =>
      current.includes(platformId)
        ? current.filter((id) => id !== platformId)
        : [...current, platformId]
    );
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "games", label: "Games", count: games.length },
    { key: "sources", label: "Fontes de Review", count: publishers.length },
    { key: "developers", label: "Developers", count: developers.length },
    {
      key: "gamePublishers",
      label: "Publishers de Jogos",
      count: gamePublishers.length,
    },
    { key: "import", label: "Importar jogos" },
  ];

  const inputClass = InputClass();
  const gameFormAction = editingGameId ? updateGame : createGame;
  const sourceFormAction = editingSourceId ? updateReviewSource : createPublisher;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-2 sm:min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? "bg-slate-950/10 text-slate-900"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "games" && (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <SectionCard className="h-fit">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {editingGameId ? "Editar jogo" : "Novo jogo"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {editingGameId
                    ? "Atualize apenas as informações necessárias."
                    : "Cadastre um jogo com developer, publisher e plataformas."}
                </p>
              </div>

              {editingGameId && (
                <button
                  type="button"
                  onClick={resetGameForm}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  Cancelar
                </button>
              )}
            </div>

            <form action={gameFormAction} className="space-y-4">
              {editingGameId && (
                <input type="hidden" name="game_id" value={editingGameId} />
              )}

              <div>
                <FieldLabel htmlFor="title">Título *</FieldLabel>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Ex: Elden Ring"
                  className={inputClass}
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="slug">Slug</FieldLabel>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="Ex: elden-ring"
                  className={inputClass}
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="release_date">Data de lançamento</FieldLabel>
                <input
                  id="release_date"
                  name="release_date"
                  type="date"
                  className={inputClass}
                  value={releaseDateValue}
                  onChange={(e) => setReleaseDateValue(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="game_publisher_id">
                  Publisher do jogo
                </FieldLabel>
                <select
                  id="game_publisher_id"
                  name="game_publisher_id"
                  className={inputClass}
                  value={gamePublisherIdValue}
                  onChange={(e) => setGamePublisherIdValue(e.target.value)}
                >
                  <option value="">Selecione um publisher do jogo</option>
                  {gamePublishers.map((publisher) => (
                    <option key={publisher.id} value={publisher.id}>
                      {publisher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="developer_id">Developer</FieldLabel>
                <select
                  id="developer_id"
                  name="developer_id"
                  className={inputClass}
                  value={developerIdValue}
                  onChange={(e) => setDeveloperIdValue(e.target.value)}
                >
                  <option value="">Selecione um developer</option>
                  {developers.map((developer) => (
                    <option key={developer.id} value={developer.id}>
                      {developer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 block text-sm font-medium text-slate-300">
                  Plataformas
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {platforms.map((platform) => {
                    const checked = selectedPlatformIds.includes(platform.id);

                    return (
                      <label
                        key={platform.id}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-600"
                      >
                        <input
                          type="checkbox"
                          name="platform_ids"
                          value={platform.id}
                          checked={checked}
                          onChange={() => togglePlatform(platform.id)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>{platform.name}</span>
                      </label>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Você pode selecionar mais de uma plataforma.
                </p>
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.99]"
              >
                {editingGameId ? "Salvar alterações" : "Salvar jogo"}
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Jogos cadastrados
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Visualize rapidamente o catálogo atual.
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-slate-300">
                {games.length} {games.length === 1 ? "jogo" : "jogos"}
              </span>
            </div>

            {games.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
                Nenhum jogo cadastrado ainda.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {games.map((game) => {
                  const linkedDeveloper = game.developer_id
                    ? developerMap.get(game.developer_id)
                    : null;

                  const linkedGamePublisher = game.game_publisher_id
                    ? gamePublisherMap.get(game.game_publisher_id)
                    : null;

                  const linkedPlatformIds = gamePlatformMap.get(game.id) ?? [];
                  const linkedPlatforms = linkedPlatformIds
                    .map((id) => platformMap.get(id))
                    .filter(Boolean) as Platform[];

                  return (
                    <article
                      key={game.id}
                      className="group relative rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 transition hover:border-slate-700 hover:bg-slate-950"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-white">
                            {game.title}
                          </h3>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {game.slug}
                          </p>
                        </div>

                        <ScoreCircle score={game.score_weighted} />
                      </div>

                      <dl className="space-y-2 text-sm">
                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Publisher do jogo</dt>
                          <dd className="text-slate-200">
                            {linkedGamePublisher?.name ?? "Não informado"}
                          </dd>
                        </div>

                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Developer</dt>
                          <dd className="text-slate-200">
                            {linkedDeveloper?.name ?? "Não informado"}
                          </dd>
                        </div>

                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Plataformas</dt>
                          <dd className="flex flex-wrap gap-2">
                            {linkedPlatforms.length > 0 ? (
                              linkedPlatforms.map((platform) => (
                                <span
                                  key={platform.id}
                                  className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300"
                                >
                                  {platform.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-200">
                                Não informado
                              </span>
                            )}
                          </dd>
                        </div>

                        <div className="flex flex-col gap-1">
                          <dt className="text-slate-500">Lançamento</dt>
                          <dd className="text-slate-200">
                            {game.release_date ?? "Não informado"}
                          </dd>
                        </div>
                      </dl>

                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => handleEditGame(game)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                          title="Editar jogo"
                          aria-label={`Editar ${game.title}`}
                        >
                          ✎
                        </button>

                        {/* Deletar */}
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmDelete = confirm(
                              `Tem certeza que deseja excluir o jogo "${game.title}"?`
                            );

                            if (!confirmDelete) return;

                            const formData = new FormData();
                            formData.append("game_id", game.id);

                            try {
                              await deleteGame(formData);
                            } catch (error) {
                              console.error(error);
                              alert("Não foi possível excluir o jogo.");
                            }
                          }}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-red-500 hover:text-red-400"
                          title="Excluir jogo"
                          aria-label={`Excluir ${game.title}`}
                        >
                          🗑
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === "sources" && (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <SectionCard className="h-fit">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {editingSourceId ? "Editar fonte de review" : "Nova fonte de review"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {editingSourceId
                    ? "Atualize apenas as informações necessárias."
                    : "Cadastre os veículos que publicarão críticas agregadas."}
                </p>
              </div>

              {editingSourceId && (
                <button
                  type="button"
                  onClick={resetSourceForm}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  Cancelar
                </button>
              )}
            </div>

            <form action={sourceFormAction} className="space-y-4">
              {editingSourceId && (
                <input type="hidden" name="source_id" value={editingSourceId} />
              )}

              <div>
                <FieldLabel htmlFor="publisher-name">Nome da fonte *</FieldLabel>
                <input
                  id="publisher-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ex: Voxel"
                  className={inputClass}
                  value={sourceNameValue}
                  onChange={(e) => setSourceNameValue(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="publisher-slug">Slug</FieldLabel>
                <input
                  id="publisher-slug"
                  name="slug"
                  type="text"
                  placeholder="Ex: voxel"
                  className={inputClass}
                  value={sourceSlugValue}
                  onChange={(e) => setSourceSlugValue(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="website_url">Website da fonte</FieldLabel>
                <input
                  id="website_url"
                  name="website_url"
                  type="url"
                  placeholder="https://..."
                  className={inputClass}
                  value={sourceWebsiteValue}
                  onChange={(e) => setSourceWebsiteValue(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="trust_weight">Peso de confiança</FieldLabel>
                <input
                  id="trust_weight"
                  name="trust_weight"
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={sourceTrustWeightValue}
                  onChange={(e) => setSourceTrustWeightValue(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="review_scale_default">
                  Escala padrão da nota
                </FieldLabel>
                <input
                  id="review_scale_default"
                  name="review_scale_default"
                  type="number"
                  placeholder="Ex: 10 ou 100"
                  className={inputClass}
                  value={sourceReviewScaleValue}
                  onChange={(e) => setSourceReviewScaleValue(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.99]"
              >
                {editingSourceId ? "Salvar alterações" : "Salvar fonte"}
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Fontes de review cadastradas
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Sites e portais usados na agregação das notas.
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-slate-300">
                {publishers.length} {publishers.length === 1 ? "fonte" : "fontes"}
              </span>
            </div>

            {publishers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
                Nenhuma fonte cadastrada ainda.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {publishers.map((publisher) => (
                  <article
                    key={publisher.id}
                    className="relative rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 transition hover:border-slate-700"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {publisher.name}
                    </h3>

                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex flex-col gap-1">
                        <dt className="text-slate-500">Slug</dt>
                        <dd className="text-slate-200">{publisher.slug}</dd>
                      </div>

                      <div className="flex flex-col gap-1">
                        <dt className="text-slate-500">Website</dt>
                        <dd className="break-all text-slate-200">
                          {publisher.website_url ?? "Não informado"}
                        </dd>
                      </div>

                      <div className="flex flex-col gap-1">
                        <dt className="text-slate-500">Peso</dt>
                        <dd className="text-slate-200">{publisher.trust_weight}</dd>
                      </div>

                      <div className="flex flex-col gap-1">
                        <dt className="text-slate-500">Escala padrão</dt>
                        <dd className="text-slate-200">
                          {publisher.review_scale_default ?? "Não informado"}
                        </dd>
                      </div>
                    </dl>

                    <button
                      type="button"
                      onClick={() => handleEditSource(publisher)}
                      className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                      title="Editar fonte"
                      aria-label={`Editar ${publisher.name}`}
                    >
                      ✎
                    </button>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === "developers" && (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <SectionCard className="h-fit">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Novo developer
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Cadastre os estúdios responsáveis pelos jogos.
              </p>
            </div>

            <form action={createDeveloper} className="space-y-4">
              <div>
                <FieldLabel htmlFor="developer-name">Nome *</FieldLabel>
                <input
                  id="developer-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ex: FromSoftware"
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel htmlFor="developer-slug">Slug</FieldLabel>
                <input
                  id="developer-slug"
                  name="slug"
                  type="text"
                  placeholder="Ex: fromsoftware"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.99]"
              >
                Salvar developer
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Developers cadastrados
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Estúdios e equipes já disponíveis para vinculação.
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-slate-300">
                {developers.length}{" "}
                {developers.length === 1 ? "developer" : "developers"}
              </span>
            </div>

            {developers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
                Nenhum developer cadastrado ainda.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {developers.map((developer) => (
                  <article
                    key={developer.id}
                    className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 transition hover:border-slate-700"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {developer.name}
                    </h3>

                    <p className="mt-3 text-sm text-slate-500">Slug</p>
                    <p className="text-sm text-slate-200">{developer.slug}</p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === "gamePublishers" && (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <SectionCard className="h-fit">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Novo publisher de jogo
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Cadastre as publishers responsáveis pela distribuição dos jogos.
              </p>
            </div>

            <form action={createGamePublisher} className="space-y-4">
              <div>
                <FieldLabel htmlFor="game-publisher-name">Nome *</FieldLabel>
                <input
                  id="game-publisher-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ex: Bandai Namco"
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel htmlFor="game-publisher-slug">Slug</FieldLabel>
                <input
                  id="game-publisher-slug"
                  name="slug"
                  type="text"
                  placeholder="Ex: bandai-namco"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.99]"
              >
                Salvar publisher de jogo
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Publishers de jogos cadastrados
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Empresas vinculadas diretamente aos jogos do catálogo.
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-slate-300">
                {gamePublishers.length}{" "}
                {gamePublishers.length === 1 ? "publisher" : "publishers"}
              </span>
            </div>

            {gamePublishers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
                Nenhum publisher de jogo cadastrado ainda.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {gamePublishers.map((publisher) => (
                  <article
                    key={publisher.id}
                    className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 transition hover:border-slate-700"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {publisher.name}
                    </h3>

                    <p className="mt-3 text-sm text-slate-500">Slug</p>
                    <p className="text-sm text-slate-200">{publisher.slug}</p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === "import" && <ImportGames />}
    </div>
  );
}