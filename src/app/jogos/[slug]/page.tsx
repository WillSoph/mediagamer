import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GameDetailsClient from "@/components/game/GameDetailsClient";
import Image from "next/image";

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
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;
};

type Platform = {
  id: string;
  name: string;
  slug: string;
};

type GamePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getGamePageData(slug: string) {
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select(
      "id, title, slug, release_date, score_weighted, review_count, developer_id, game_publisher_id, cover_url"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (gameError || !game) {
    return null;
  }

  const [
    { data: reviews, error: reviewsError },
    { data: developer },
    { data: gamePublisher },
    { data: allPlatforms, error: platformsError },
    { data: linkedPlatforms, error: linkedPlatformsError },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select(`
        id,
        source_url,
        source_title,
        author_name,
        published_at,
        platform,
        score_original,
        score_scale,
        score_normalized,
        excerpt,
        verdict,
        publisher:publishers (
          id,
          name,
          slug
        )
      `)
      .eq("game_id", game.id)
      .eq("status", "approved")
      .order("published_at", { ascending: false }),

    game.developer_id
      ? supabase
          .from("developers")
          .select("id, name, slug")
          .eq("id", game.developer_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    game.game_publisher_id
      ? supabase
          .from("game_publishers")
          .select("id, name, slug")
          .eq("id", game.game_publisher_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    supabase.from("platforms").select("id, name, slug").order("name", {
      ascending: true,
    }),

    supabase
      .from("game_platforms")
      .select("platform_id, platforms(id, name, slug)")
      .eq("game_id", game.id),
  ]);

  if (reviewsError) {
    console.error("Erro ao buscar reviews:", reviewsError.message);
  }

  if (platformsError) {
    console.error("Erro ao buscar plataformas:", platformsError.message);
  }

  if (linkedPlatformsError) {
    console.error(
      "Erro ao buscar plataformas do jogo:",
      linkedPlatformsError.message
    );
  }

  const linkedPlatformSlugs =
    linkedPlatforms
      ?.map((item) => {
        const platform = Array.isArray(item.platforms)
          ? item.platforms[0]
          : item.platforms;
        return platform?.slug ?? null;
      })
      .filter(Boolean) ?? [];

  return {
    game: {
      title: game.title,
      release_date: game.release_date,
      review_count: game.review_count,
      score_weighted: game.score_weighted,
      developerName: developer?.name ?? null,
      publisherName: gamePublisher?.name ?? null,
      coverUrl: game.cover_url ?? null,
    },
    reviews: (reviews ?? []) as ReviewItem[],
    allPlatforms: (allPlatforms ?? []) as Platform[],
    linkedPlatformSlugs: linkedPlatformSlugs as string[],
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const data = await getGamePageData(slug);

  if (!data) {
    return (
      <main className="min-h-screen bg-bg px-4 py-10 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-border/80 bg-card/70 p-8">
            <h1 className="font-display text-3xl font-bold text-text">
              Jogo não encontrado
            </h1>
            <p className="mt-3 text-text-secondary">
              Não foi possível encontrar um jogo com esse slug.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 font-semibold text-bg transition hover:bg-primary-hover"
            >
              Voltar para a home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="border-b border-border/80 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
                src="/logo/loguinho-mediagamer.png"
                alt="MediaGamer"
                width={10}
                height={10}
                className="h-10 w-10 object-contain"
                priority
            />

            <div>
              <p className="font-display text-lg font-bold tracking-tight text-text">
                MediaGamer
              </p>
              <p className="text-xs text-text-secondary">
                Game reviews e scores confiáveis
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-text"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <GameDetailsClient
        game={data.game}
        reviews={data.reviews}
        allPlatforms={data.allPlatforms}
        linkedPlatformSlugs={data.linkedPlatformSlugs}
      />
    </main>
  );
}