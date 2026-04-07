import Image from "next/image";
import Link from "next/link";

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      {/* Header simples */}
      <header className="border-b border-border/80 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
                src="/logo/loguinho-mediagamer.png"
                alt="MediaGamer"
                width={10}
                height={10}
                className="h-10 w-10 object-contain"
                priority
            />

            <div>
              <p className="font-display text-lg font-bold text-text">
                MediaGamer
              </p>
              <p className="text-xs text-text-secondary">
                Game reviews e scores confiáveis
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition hover:border-accent hover:text-text"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-card/70 p-8 sm:p-10">
          {/* Título */}
          <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Sobre o MediaGamer
          </h1>

          {/* Intro */}
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            O <strong>MediaGamer</strong> é uma plataforma brasileira criada para
            reunir, organizar e destacar <strong>reviews de games</strong>
             publicadas por veículos e criadores de conteúdo do Brasil.
          </p>

          {/* Missão */}
          <div className="mt-10 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text">
              Nossa missão
            </h2>

            <p className="text-text-secondary leading-7">
              Nosso objetivo é facilitar a descoberta de jogos através de uma
              experiência moderna, centralizando análises confiáveis em um único
              lugar.
            </p>

            <p className="text-text-secondary leading-7">
              Em vez de procurar reviews em vários sites, o usuário encontra aqui
              uma visão consolidada com notas, opiniões e diferentes perspectivas
              sobre cada jogo.
            </p>
          </div>

          {/* Diferencial */}
          <div className="mt-10 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text">
              Foco no Brasil 🇧🇷
            </h2>

            <p className="text-text-secondary leading-7">
              Diferente de grandes agregadores internacionais, o MediaGamer nasce
              com um propósito claro:
            </p>

            <p className="text-text">
              <strong>
                valorizar o conteúdo produzido por criadores e veículos
                brasileiros.
              </strong>
            </p>

            <p className="text-text-secondary leading-7">
              Aqui, reviews nacionais ganham visibilidade, fortalecendo o
              ecossistema de mídia gamer no Brasil.
            </p>
          </div>

          {/* Para quem é */}
          <div className="mt-10 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text">
              Para quem é o MediaGamer?
            </h2>

            <ul className="space-y-3 text-text-secondary">
              <li>🎮 Jogadores que querem decidir qual game comprar</li>
              <li>🧠 Pessoas que buscam análises confiáveis</li>
              <li>🇧🇷 Público que prefere conteúdo em português</li>
              <li>📢 Criadores que querem mais visibilidade</li>
            </ul>
          </div>

          {/* Futuro */}
          <div className="mt-10 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text">
              O que vem por aí
            </h2>

            <ul className="space-y-3 text-text-secondary">
              <li>✨ Resumos de reviews com inteligência artificial</li>
              <li>🏆 Rankings dos melhores jogos</li>
              <li>🔎 Filtros avançados por nota e plataforma</li>
              <li>📊 Comparação entre versões (PS5, Xbox, PC, etc.)</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl border border-border bg-bg/60 p-6 text-center">
            <h3 className="font-display text-xl font-semibold text-text">
              Explore os jogos agora
            </h3>

            <p className="mt-2 text-sm text-text-secondary">
              Descubra novos títulos e veja o que a mídia gamer brasileira está
              dizendo.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-bg transition hover:bg-primary-hover"
            >
              Ver jogos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}