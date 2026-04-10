import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: games } = await supabase
    .from("games")
    .select("slug, updated_at");

  const baseUrl = "https://mediagamer.com.br";

  const gameUrls =
    games?.map((game) => ({
      url: `${baseUrl}/jogos/${game.slug}`,
      lastModified: game.updated_at,
    })) ?? [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...gameUrls,
  ];
}