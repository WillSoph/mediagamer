"use client";

import { useMemo, useState } from "react";
import { importGames } from "@/app/admin/catalog/import-actions";

type RawgGame = {
  id: number;
  name: string;
  slug: string;
  released: string | null;
  background_image: string | null;
};

type RawgResponse = {
  results: RawgGame[];
  next: string | null;
  previous: string | null;
};

export default function ImportGames() {
  const [games, setGames] = useState<RawgGame[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const selectedCount = selected.length;

  const uniqueGames = useMemo(() => {
    const map = new Map<number, RawgGame>();

    for (const game of games) {
      if (!map.has(game.id)) {
        map.set(game.id, game);
      }
    }

    return Array.from(map.values());
  }, [games]);

  async function fetchPage(pageToLoad: number, append = false) {
    setLoading(true);

    try {
      const res = await fetch(`/api/rawg/games?page=${pageToLoad}`);
      const data: RawgResponse = await res.json();

      if (!res.ok) {
        throw new Error("Erro ao buscar jogos.");
      }

      setGames((prev) =>
        append ? [...prev, ...(data.results ?? [])] : data.results ?? []
      );

      setPage(pageToLoad);
      setHasNextPage(Boolean(data.next));
      setHasLoadedOnce(true);
    } catch (error) {
      console.error(error);
      alert("Não foi possível buscar os jogos da RAWG.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFirstLoad() {
    setSelected([]);
    await fetchPage(1, false);
  }

  async function handleLoadMore() {
    if (!hasNextPage || loading) return;
    await fetchPage(page + 1, true);
  }

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleAllVisible() {
    const visibleIds = uniqueGames.map((game) => game.id);
    const allSelected = visibleIds.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelected((prev) => Array.from(new Set([...prev, ...visibleIds])));
  }

  async function handleImport() {
    const selectedGames = uniqueGames.filter((game) => selected.includes(game.id));

    if (selectedGames.length === 0) {
      alert("Selecione pelo menos um jogo para importar.");
      return;
    }

    setImporting(true);

    try {
      await importGames(selectedGames);
      alert("Jogos importados com sucesso.");
      setSelected([]);
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao importar os jogos.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Importar jogos
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Busque lançamentos do ano atual na RAWG e importe os selecionados.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleFirstLoad}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && !hasLoadedOnce ? "Buscando..." : "Buscar jogos do ano"}
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={importing || selectedCount === 0}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing
              ? "Importando..."
              : `Importar selecionados${
                  selectedCount > 0 ? ` (${selectedCount})` : ""
                }`}
          </button>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Página atual</span>
            <span className="font-medium text-slate-200">
              {page > 0 ? page : "--"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Jogos carregados</span>
            <span className="font-medium text-slate-200">
              {uniqueGames.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Selecionados</span>
            <span className="font-medium text-slate-200">{selectedCount}</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Resultados da RAWG
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Jogos lançados e previstos para o ano atual.
            </p>
          </div>

          {uniqueGames.length > 0 && (
            <button
              type="button"
              onClick={toggleAllVisible}
              className="w-fit rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              Marcar / desmarcar todos
            </button>
          )}
        </div>

        {!hasLoadedOnce && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
            Clique em <span className="text-white">Buscar jogos do ano</span> para
            carregar os resultados da RAWG.
          </div>
        )}

        {hasLoadedOnce && uniqueGames.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
            Nenhum jogo retornado pela RAWG.
          </div>
        )}

        {uniqueGames.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {uniqueGames.map((game) => {
                const checked = selected.includes(game.id);

                return (
                  <label
                    key={game.id}
                    className="flex cursor-pointer flex-col rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4 transition hover:border-slate-700"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(game.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                          checked
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {checked ? "Selecionado" : "Disponível"}
                      </span>
                    </div>

                    <div className="mb-4 h-40 rounded-2xl bg-slate-900 ring-1 ring-white/5 overflow-hidden">
                      {game.background_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={game.background_image}
                          alt={game.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-lg font-semibold text-white">
                      {game.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Lançamento: {game.released ?? "Não informado"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">{game.slug}</p>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              {hasNextPage ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Carregando..." : "Carregar mais"}
                </button>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                  Não há mais jogos para carregar.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}