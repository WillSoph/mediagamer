import { supabase } from "@/lib/supabase";
import type { Game } from "@/types/game";

export async function getGames(limit?: number): Promise<Game[]> {
  let query = supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar jogos:", error.message);
    throw new Error("Não foi possível buscar os jogos.");
  }

  return data as Game[];
}