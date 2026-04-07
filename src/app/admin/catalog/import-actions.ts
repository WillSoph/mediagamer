"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

type RawgPlatformItem = {
  platform?: {
    id?: number;
    name?: string;
    slug?: string;
  };
};

type RawgCompany = {
  id?: number;
  name?: string;
  slug?: string;
};

type RawgGameListItem = {
  id: number;
  name: string;
  slug: string;
  released: string | null;
  background_image: string | null;
};

type RawgGameDetail = {
  id: number;
  name: string;
  slug: string;
  released: string | null;
  background_image: string | null;
  platforms?: RawgPlatformItem[];
  developers?: RawgCompany[];
  publishers?: RawgCompany[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeRawgPlatformSlug(slug?: string | null): string | null {
  if (!slug) return null;

  const value = slug.toLowerCase();

  if (value === "playstation5" || value === "playstation-5" || value === "ps5") {
    return "ps5";
  }

  if (
    value.includes("xbox-series") ||
    value === "xbox" ||
    value === "xbox-series-x" ||
    value === "xbox-series-s"
  ) {
    return "xbox";
  }

  if (value === "pc") {
    return "pc";
  }

  if (
    value === "nintendo-switch-2" ||
    value === "switch-2" ||
    value === "switch2"
  ) {
    return "switch2";
  }

  return null;
}

async function fetchRawgGameDetail(slug: string): Promise<RawgGameDetail> {
  const API_KEY = process.env.RAWG_API_KEY;

  if (!API_KEY) {
    throw new Error("RAWG_API_KEY não configurada.");
  }

  const url = `https://api.rawg.io/api/games/${slug}?key=${API_KEY}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar detalhes do jogo na RAWG: ${slug}`);
  }

  return res.json();
}

async function getOrCreateDeveloperId(rawgDeveloper?: RawgCompany) {
  if (!rawgDeveloper?.name) return null;

  const slug = rawgDeveloper.slug
    ? slugify(rawgDeveloper.slug)
    : slugify(rawgDeveloper.name);

  const { data: existing, error: selectError } = await supabase
    .from("developers")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Erro ao buscar developer: ${selectError.message}`);
  }

  if (existing?.id) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("developers")
    .insert({
      name: rawgDeveloper.name,
      slug,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Erro ao criar developer: ${insertError.message}`);
  }

  return created.id;
}

async function getOrCreateGamePublisherId(rawgPublisher?: RawgCompany) {
  if (!rawgPublisher?.name) return null;

  const slug = rawgPublisher.slug
    ? slugify(rawgPublisher.slug)
    : slugify(rawgPublisher.name);

  const { data: existing, error: selectError } = await supabase
    .from("game_publishers")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Erro ao buscar publisher do jogo: ${selectError.message}`);
  }

  if (existing?.id) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("game_publishers")
    .insert({
      name: rawgPublisher.name,
      slug,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Erro ao criar publisher do jogo: ${insertError.message}`);
  }

  return created.id;
}

async function getPlatformIdsFromRawg(platforms?: RawgPlatformItem[]) {
  if (!platforms?.length) return [] as string[];

  const normalizedSlugs = Array.from(
    new Set(
      platforms
        .map((item) => normalizeRawgPlatformSlug(item.platform?.slug))
        .filter(Boolean) as string[]
    )
  );

  if (normalizedSlugs.length === 0) return [];

  const { data, error } = await supabase
    .from("platforms")
    .select("id, slug")
    .in("slug", normalizedSlugs);

  if (error) {
    throw new Error(`Erro ao buscar plataformas: ${error.message}`);
  }

  return (data ?? []).map((platform) => platform.id);
}

export async function importGames(games: RawgGameListItem[]) {
  for (const game of games) {
    const { data: existing } = await supabase
      .from("games")
      .select("id")
      .eq("slug", game.slug)
      .maybeSingle();

    if (existing) continue;

    const detail = await fetchRawgGameDetail(game.slug);

    const developerId = await getOrCreateDeveloperId(detail.developers?.[0]);
    const gamePublisherId = await getOrCreateGamePublisherId(detail.publishers?.[0]);
    const platformIds = await getPlatformIdsFromRawg(detail.platforms);

    const { data: createdGame, error: insertGameError } = await supabase
      .from("games")
      .insert({
        title: detail.name,
        slug: detail.slug,
        release_date: detail.released,
        cover_url: detail.background_image,
        developer_id: developerId,
        game_publisher_id: gamePublisherId,
      })
      .select("id")
      .single();

    if (insertGameError || !createdGame) {
      throw new Error(
        `Erro ao importar jogo "${detail.name}": ${
          insertGameError?.message ?? "desconhecido"
        }`
      );
    }

    if (platformIds.length > 0) {
      const rows = platformIds.map((platformId) => ({
        game_id: createdGame.id,
        platform_id: platformId,
      }));

      const { error: relationError } = await supabase
        .from("game_platforms")
        .insert(rows);

      if (relationError) {
        throw new Error(
          `Jogo "${detail.name}" importado, mas houve erro ao salvar plataformas: ${relationError.message}`
        );
      }
    }
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/");
}