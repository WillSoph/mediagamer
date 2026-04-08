export const revalidate = 3600;

import { getGames, getUpcomingGames } from "@/services/games";
import HomeClient from "@/components/home/HomeClient";

export default async function Home() {
  const [latestGames, upcomingGames] = await Promise.all([
    getGames(50),
    getUpcomingGames(12),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <HomeClient
        latestGames={latestGames}
        upcomingGames={upcomingGames}
      />
    </main>
  );
}