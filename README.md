# Plataforma de Gestão — API (G1)

API oficial do Recreio Arcade. Recebe submissões de jogos por link do GitHub, conduz a curadoria, entrega os pacotes aprovados ao fliperama, recebe placares e votos e calcula os rankings.

Quem consome:

- **Portal Web (G2)** — catálogo, submissão, curadoria e rankings.
- **Fliperama (G3)** — sincroniza o catálogo, baixa pacotes e envia placares.

## Stack

- Node.js 24 + TypeScript
- Fastify 5
- PostgreSQL (Supabase em produção) com Drizzle ORM
- Vitest

## Fluxo de branches

Segue o padrão da organização:

- `main` — estável, o que está em produção.
- `develop` — integração.
- `feature/*` — nasce de `develop` e volta por Pull Request.

Commits seguem Conventional Commits em português: `feat: adiciona ...`, `fix: corrige ...`, `docs: ...`, `test: ...`, `chore: ...`, `ci: ...`.
