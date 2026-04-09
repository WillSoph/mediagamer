"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                  src="/logo/loguinho-mediagamer-2.png"
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
            </div>

            <p className="mt-4 text-sm text-text-secondary">
              Plataforma brasileira focada em reviews e análise de jogos.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <p className="mb-3 font-display text-sm font-semibold text-text">
              Navegação
            </p>

            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <Link href="/" className="hover:text-text transition">
                Games
              </Link>

              <Link href="/sobre" className="hover:text-text transition">
                Sobre
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="mb-3 font-display text-sm font-semibold text-text">
              Redes sociais
            </p>

            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <a
                href="https://www.instagram.com/media.gamer.br?igsh=bzd4OTNxd2lsa2R6"
                target="_blank"
                className="hover:text-text transition"
              >
                Instagram
              </a>

              <a
                href="#"
                target="_blank"
                className="hover:text-text transition"
              >
                YouTube
              </a>

              <a
                href="https://www.tiktok.com/@mediagamer20?_r=1&_t=ZS-95OvKGyOdCH"
                target="_blank"
                className="hover:text-text transition"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} MediaGamer. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}