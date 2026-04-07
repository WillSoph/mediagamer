import { supabase } from "@/lib/supabase";
import AdminTabs from "./AdminTabs";

async function getCatalogData() {
  const [
    { data: games, error: gamesError },
    { data: publishers, error: publishersError },
    { data: developers, error: developersError },
    { data: gamePublishers, error: gamePublishersError },
    { data: platforms, error: platformsError },
    { data: gamePlatforms, error: gamePlatformsError },
  ] = await Promise.all([
    supabase
      .from("games")
      .select(
        "id, title, slug, release_date, developer_id, game_publisher_id, score_weighted"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("publishers")
      .select("id, name, slug, website_url, trust_weight, review_scale_default")
      .order("created_at", { ascending: false }),

    supabase
      .from("developers")
      .select("id, name, slug")
      .order("created_at", { ascending: false }),

    supabase
      .from("game_publishers")
      .select("id, name, slug")
      .order("created_at", { ascending: false }),

    supabase
      .from("platforms")
      .select("id, name, slug")
      .order("name", { ascending: true }),

    supabase
      .from("game_platforms")
      .select("game_id, platform_id"),
  ]);

  if (gamesError) {
    throw new Error(`Erro ao buscar games: ${gamesError.message}`);
  }

  if (publishersError) {
    throw new Error(
      `Erro ao buscar fontes de review: ${publishersError.message}`
    );
  }

  if (developersError) {
    throw new Error(`Erro ao buscar developers: ${developersError.message}`);
  }

  if (gamePublishersError) {
    throw new Error(
      `Erro ao buscar publishers de jogos: ${gamePublishersError.message}`
    );
  }

  if (platformsError) {
    throw new Error(`Erro ao buscar plataformas: ${platformsError.message}`);
  }

  if (gamePlatformsError) {
    throw new Error(
      `Erro ao buscar relações jogo-plataforma: ${gamePlatformsError.message}`
    );
  }

  return {
    games: games ?? [],
    publishers: publishers ?? [],
    developers: developers ?? [],
    gamePublishers: gamePublishers ?? [],
    platforms: platforms ?? [],
    gamePlatforms: gamePlatforms ?? [],
  };
}

export default async function AdminCatalogPage() {
  const {
    games,
    publishers,
    developers,
    gamePublishers,
    platforms,
    gamePlatforms,
  } = await getCatalogData();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Admin · Catálogo
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Gerencie games, fontes de review, developers, publishers de jogos e
            plataformas em um só lugar, com uma estrutura organizada e pronta
            para escalar.
          </p>
        </header>

        <AdminTabs
          games={games}
          publishers={publishers}
          developers={developers}
          gamePublishers={gamePublishers}
          platforms={platforms}
          gamePlatforms={gamePlatforms}
        />
      </div>
    </main>
  );
}