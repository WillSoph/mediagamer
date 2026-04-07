import { supabase } from "@/lib/supabase";
import { createGame } from "./actions";

async function getGames() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar jogos: ${error.message}`);
  }

  return data ?? [];
}

export default async function AdminGamesPage() {
  const games = await getGames();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold">Admin · Jogos</h1>
          <p className="mt-2 text-slate-400">
            Cadastre e gerencie os jogos do projeto.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Novo jogo</h2>

            <form action={createGame} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Título *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Ex: Elden Ring"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="Ex: elden-ring"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Se deixar vazio, será gerado automaticamente com base no
                  título.
                </p>
              </div>

              <div>
                <label
                  htmlFor="release_date"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Data de lançamento
                </label>
                <input
                  id="release_date"
                  name="release_date"
                  type="date"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="developer"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Developer
                </label>
                <input
                  id="developer"
                  name="developer"
                  type="text"
                  placeholder="Ex: FromSoftware"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="publisher_name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Publisher
                </label>
                <input
                  id="publisher_name"
                  name="publisher_name"
                  type="text"
                  placeholder="Ex: Bandai Namco"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Salvar jogo
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Jogos cadastrados</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                {games.length} {games.length === 1 ? "jogo" : "jogos"}
              </span>
            </div>

            {games.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-400">
                Nenhum jogo cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {games.map((game) => (
                  <article
                    key={game.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{game.title}</h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Slug: {game.slug}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Developer: {game.developer ?? "Não informado"}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Publisher: {game.publisher_name ?? "Não informado"}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Lançamento: {game.release_date ?? "Não informado"}
                        </p>
                      </div>

                      <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300">
                        {game.score_weighted ?? "--"}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}