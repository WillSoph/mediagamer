"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function createReview(formData: FormData) {
  const gameId = String(formData.get("game_id") ?? "").trim();
  const publisherId = String(formData.get("publisher_id") ?? "").trim();
  const platformSlug = String(formData.get("platform") ?? "").trim();

  const sourceUrl = String(formData.get("source_url") ?? "").trim();
  const sourceTitle = String(formData.get("source_title") ?? "").trim();
  const authorName = String(formData.get("author_name") ?? "").trim();
  const publishedAt = String(formData.get("published_at") ?? "").trim();

  const scoreOriginalRaw = String(formData.get("score_original") ?? "").trim();
  const scoreScaleRaw = String(formData.get("score_scale") ?? "").trim();

  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const verdict = String(formData.get("verdict") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!gameId) {
    throw new Error("O jogo é obrigatório.");
  }

  if (!publisherId) {
    throw new Error("A fonte de review é obrigatória.");
  }

  if (!sourceUrl) {
    throw new Error("A URL da review é obrigatória.");
  }

  if (!sourceTitle) {
    throw new Error("O título da review é obrigatório.");
  }

  const scoreOriginal = scoreOriginalRaw ? Number(scoreOriginalRaw) : null;
  const scoreScale = scoreScaleRaw ? Number(scoreScaleRaw) : null;

  const { error } = await supabase.from("reviews").insert({
    game_id: gameId,
    publisher_id: publisherId,
    platform: platformSlug || null,
    source_url: sourceUrl,
    source_title: sourceTitle,
    author_name: authorName || null,
    published_at: publishedAt || null,
    score_original: scoreOriginal,
    score_scale: scoreScale,
    excerpt: excerpt || null,
    verdict: verdict || null,
    status: status || "pending_review",
    ingestion_method: "manual",
  });

  if (error) {
    throw new Error(`Erro ao criar review: ${error.message}`);
  }

  if (status === "approved") {
    const { error: scoreError } = await supabase.rpc("recalculate_game_scores", {
      p_game_id: gameId,
    });

    if (scoreError) {
      throw new Error(
        `Review criada, mas houve erro ao recalcular score do jogo: ${scoreError.message}`
      );
    }
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}