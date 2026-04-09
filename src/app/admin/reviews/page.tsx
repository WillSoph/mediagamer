import { supabase } from "@/lib/supabase";
import AdminReviewsClient from "./AdminReviewsClient";

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

async function getReviewAdminData() {
  const [
    { data: games, error: gamesError },
    { data: publishers, error: publishersError },
    { data: platforms, error: platformsError },
    { data: reviews, error: reviewsError },
  ] = await Promise.all([
    supabase
      .from("games")
      .select("id, title, slug")
      .order("title", { ascending: true }),

    supabase
      .from("publishers")
      .select("id, name, slug")
      .order("name", { ascending: true }),

    supabase
      .from("platforms")
      .select("id, name, slug")
      .order("name", { ascending: true }),

    supabase
      .from("reviews")
      .select(`
        id,
        game_id,
        publisher_id,
        source_title,
        source_url,
        author_name,
        platform,
        score_original,
        score_scale,
        score_normalized,
        excerpt,
        verdict,
        status,
        published_at,
        game:games (
          title,
          slug
        ),
        publisher:publishers (
          name,
          slug
        )
      `)
      .order("created_at", { ascending: false }),
  ]);

  if (gamesError) {
    throw new Error(`Erro ao buscar games: ${gamesError.message}`);
  }

  if (publishersError) {
    throw new Error(`Erro ao buscar fontes: ${publishersError.message}`);
  }

  if (platformsError) {
    throw new Error(`Erro ao buscar plataformas: ${platformsError.message}`);
  }

  if (reviewsError) {
    throw new Error(`Erro ao buscar reviews: ${reviewsError.message}`);
  }

  return {
    games: (games ?? []) as Game[],
    publishers: (publishers ?? []) as ReviewSource[],
    platforms: (platforms ?? []) as Platform[],
    reviews: (reviews ?? []) as Review[],
  };
}

export default async function AdminReviewsPage() {
  const { games, publishers, platforms, reviews } = await getReviewAdminData();

  return (
    <AdminReviewsClient
      games={games}
      publishers={publishers}
      platforms={platforms}
      reviews={reviews}
    />
  );
}