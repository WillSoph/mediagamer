import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  const { data: games } = await supabase
    .from("games")
    .select("slug");

  const gameUrls =
    games?.map((game) => ({
      url: `https://mediagamer.com.br/jogos/${game.slug}`,
    })) ?? [];

  return [
    {
      url: "https://mediagamer.com.br",
    },
    {
      url: "https://mediagamer.com.br/sobre",
    },
    ...gameUrls,
  ];
}