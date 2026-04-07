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

export async function createGame(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const releaseDate = String(formData.get("release_date") ?? "").trim();
  const developer = String(formData.get("developer") ?? "").trim();
  const publisherName = String(formData.get("publisher_name") ?? "").trim();

  if (!title) {
    throw new Error("O título é obrigatório.");
  }

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const { error } = await supabase.from("games").insert({
    title,
    slug,
    release_date: releaseDate || null,
    developer: developer || null,
    publisher_name: publisherName || null,
  });

  if (error) {
    throw new Error(`Erro ao criar jogo: ${error.message}`);
  }

  revalidatePath("/admin/games");
  revalidatePath("/");
}