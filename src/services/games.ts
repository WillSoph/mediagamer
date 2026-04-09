import { supabase } from "@/lib/supabase";
import type { Game } from "@/types/game";

export async function getGames(limit?: number): Promise<Game[]> {
  let query = supabase
    .from("games")
    .select("*")
    .gt("review_count", 0) // 🔥 FILTRO PRINCIPAL
    .order("updated_at", { ascending: false }); // 🔥 MELHOR ORDEM

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

export async function getUpcomingGames(limit = 12): Promise<Game[]> {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const next15Days = new Date(today);
  next15Days.setDate(today.getDate() + 15);
  next15Days.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("games")
    .select("*")
    .gte("release_date", tomorrow.toISOString())
    .lte("release_date", next15Days.toISOString())
    .order("release_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar próximos lançamentos:", error.message);
    throw new Error("Não foi possível buscar os próximos lançamentos.");
  }

  return data as Game[];
}