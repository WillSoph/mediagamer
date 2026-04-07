import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const API_KEY = process.env.RAWG_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "RAWG_API_KEY não configurada." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";

  const currentYear = new Date().getFullYear();

  const url = `https://api.rawg.io/api/games?key=${API_KEY}&dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-released&page_size=20&page=${page}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Erro ao buscar dados da RAWG." },
      { status: 500 }
    );
  }

  const data = await res.json();

  return NextResponse.json({
    results: data.results ?? [],
    next: data.next ?? null,
    previous: data.previous ?? null,
  });
}