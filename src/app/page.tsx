import { getGames } from "@/services/games";
import HomeClient from "@/components/home/HomeClient";

export default async function Home() {
  const games = await getGames(50);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <HomeClient games={games} />
    </main>
  );
}