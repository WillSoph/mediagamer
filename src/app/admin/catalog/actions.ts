"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

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

export async function createPublisher(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const websiteUrl = String(formData.get("website_url") ?? "").trim();
  const trustWeightRaw = String(formData.get("trust_weight") ?? "").trim();
  const reviewScaleDefaultRaw = String(
    formData.get("review_scale_default") ?? ""
  ).trim();

  if (!name) {
    throw new Error("O nome da fonte de review é obrigatório.");
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name);
  const trustWeight = trustWeightRaw ? Number(trustWeightRaw) : 1;
  const reviewScaleDefault = reviewScaleDefaultRaw
    ? Number(reviewScaleDefaultRaw)
    : null;

  const { error } = await supabase.from("publishers").insert({
    name,
    slug,
    website_url: websiteUrl || null,
    trust_weight: trustWeight,
    review_scale_default: reviewScaleDefault,
  });

  if (error) {
    throw new Error(`Erro ao criar fonte de review: ${error.message}`);
  }

  revalidatePath("/admin/catalog");
}

export async function createDeveloper(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) {
    throw new Error("O nome do developer é obrigatório.");
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  const { error } = await supabase.from("developers").insert({
    name,
    slug,
  });

  if (error) {
    throw new Error(`Erro ao criar developer: ${error.message}`);
  }

  revalidatePath("/admin/catalog");
}

export async function createGamePublisher(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) {
    throw new Error("O nome do publisher do jogo é obrigatório.");
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  const { error } = await supabase.from("game_publishers").insert({
    name,
    slug,
  });

  if (error) {
    throw new Error(`Erro ao criar publisher do jogo: ${error.message}`);
  }

  revalidatePath("/admin/catalog");
}

export async function createGame(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const releaseDate = String(formData.get("release_date") ?? "").trim();
  const developerId = String(formData.get("developer_id") ?? "").trim();
  const gamePublisherId = String(formData.get("game_publisher_id") ?? "").trim();

  const selectedPlatformIds = formData
    .getAll("platform_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!title) {
    throw new Error("O título do jogo é obrigatório.");
  }

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const { data: createdGame, error: gameError } = await supabase
    .from("games")
    .insert({
      title,
      slug,
      release_date: releaseDate || null,
      developer_id: developerId || null,
      game_publisher_id: gamePublisherId || null,
    })
    .select("id")
    .single();

  if (gameError || !createdGame) {
    throw new Error(`Erro ao criar jogo: ${gameError?.message}`);
  }

  if (selectedPlatformIds.length > 0) {
    const payload = selectedPlatformIds.map((platformId) => ({
      game_id: createdGame.id,
      platform_id: platformId,
    }));

    const { error: gamePlatformsError } = await supabase
      .from("game_platforms")
      .insert(payload);

    if (gamePlatformsError) {
      throw new Error(
        `Jogo criado, mas houve erro ao salvar plataformas: ${gamePlatformsError.message}`
      );
    }
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/");
}

export async function updateGame(formData: FormData) {
  const gameId = String(formData.get("game_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const releaseDate = String(formData.get("release_date") ?? "").trim();
  const developerId = String(formData.get("developer_id") ?? "").trim();
  const gamePublisherId = String(formData.get("game_publisher_id") ?? "").trim();

  const platformIds = formData
    .getAll("platform_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!gameId) {
    throw new Error("O ID do jogo é obrigatório para edição.");
  }

  if (!title) {
    throw new Error("O título do jogo é obrigatório.");
  }

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const { error: updateError } = await supabase
    .from("games")
    .update({
      title,
      slug,
      release_date: releaseDate || null,
      developer_id: developerId || null,
      game_publisher_id: gamePublisherId || null,
    })
    .eq("id", gameId);

  if (updateError) {
    throw new Error(`Erro ao atualizar jogo: ${updateError.message}`);
  }

  const { error: deleteRelationsError } = await supabase
    .from("game_platforms")
    .delete()
    .eq("game_id", gameId);

  if (deleteRelationsError) {
    throw new Error(
      `Jogo atualizado, mas houve erro ao limpar plataformas antigas: ${deleteRelationsError.message}`
    );
  }

  if (platformIds.length > 0) {
    const rows = platformIds.map((platformId) => ({
      game_id: gameId,
      platform_id: platformId,
    }));

    const { error: relationError } = await supabase
      .from("game_platforms")
      .insert(rows);

    if (relationError) {
      throw new Error(
        `Jogo atualizado, mas houve erro ao salvar plataformas: ${relationError.message}`
      );
    }
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/");
}

export async function updateReviewSource(formData: FormData) {
  const sourceId = String(formData.get("source_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const websiteUrl = String(formData.get("website_url") ?? "").trim();
  const trustWeightRaw = String(formData.get("trust_weight") ?? "").trim();
  const reviewScaleDefaultRaw = String(
    formData.get("review_scale_default") ?? ""
  ).trim();

  if (!sourceId) {
    throw new Error("O ID da fonte é obrigatório para edição.");
  }

  if (!name) {
    throw new Error("O nome da fonte é obrigatório.");
  }

  const trustWeight = trustWeightRaw ? Number(trustWeightRaw) : 1;
  const reviewScaleDefault = reviewScaleDefaultRaw
    ? Number(reviewScaleDefaultRaw)
    : null;

  const { error } = await supabase
    .from("publishers")
    .update({
      name,
      slug,
      website_url: websiteUrl || null,
      trust_weight: trustWeight,
      review_scale_default: reviewScaleDefault,
    })
    .eq("id", sourceId);

  if (error) {
    throw new Error(`Erro ao atualizar fonte: ${error.message}`);
  }

  revalidatePath("/admin/catalog");
}