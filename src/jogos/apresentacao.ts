import { asc, avg, count, countDistinct, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Db } from '../db/client.js'
import { curadores, jogos, partidas, versoes, votos } from '../db/schema/index.js'

// Formatos de resposta alinhados ao que o Portal (G2) consome em web/src/api.ts.

const estadoSchema = z.enum(['submetido', 'aprovado', 'reprovado', 'substituida'])

export const versaoSchema = z.object({
  id: z.uuid(),
  jogo_id: z.string(),
  versao: z.string(),
  estado: estadoSchema,
  ref: z.string(),
  commit_sha: z.string(),
  tamanho_bytes: z.number().int(),
  sha256: z.string(),
  total_questoes: z.number().int(),
  submetido_em: z.iso.datetime(),
  decidido_em: z.iso.datetime().optional(),
  decidido_por: z.string().optional(),
  justificativa: z.string().optional(),
  repositorio_url: z.string(),
})

export const gameSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  resumo: z.string(),
  classico_referencia: z.string(),
  mecanica: z.string(),
  tema: z.string(),
  nivel: z.string(),
  autores: z.array(z.string()),
  controles: z.string(),
  capa: z.string(),
  repositorio_url: z.string(),
  // Da versão em foco: a aprovada, ou a mais recente se nenhuma foi aprovada.
  versao: z.string(),
  status: estadoSchema,
  versao_id: z.uuid(),
  tamanho_bytes: z.number().int(),
  sha256: z.string(),
  nota_media: z.number(),
  votos: z.number().int(),
  jogadores_distintos: z.number().int(),
  partidas_jogadas: z.number().int(),
  versoes: z.array(versaoSchema),
})

export type Game = z.infer<typeof gameSchema>

/**
 * Monta o jogo como o Portal espera. `versaoFocoId` escolhe a versão mostrada em
 * `versao`/`status`; sem ele, vale a aprovada ou, se não houver, a mais recente.
 */
export async function montarGame(db: Db, jogoId: string, versaoFocoId?: string) {
  const [jogo] = await db.select().from(jogos).where(eq(jogos.id, jogoId))
  if (!jogo) return null

  const [listaVersoes, [notas], [jogadas]] = await Promise.all([
    db
      .select({ versao: versoes, curador: curadores.nome })
      .from(versoes)
      .leftJoin(curadores, eq(curadores.id, versoes.decididoPor))
      .where(eq(versoes.jogoId, jogoId))
      .orderBy(asc(versoes.submetidoEm)),
    db
      .select({ media: avg(votos.nota), total: count() })
      .from(votos)
      .where(eq(votos.jogoId, jogoId)),
    db
      .select({ total: count(), jogadores: countDistinct(partidas.jogador) })
      .from(partidas)
      .where(eq(partidas.jogoId, jogoId)),
  ])

  const todas = listaVersoes.map(({ versao: v, curador }) => ({
    id: v.id,
    jogo_id: v.jogoId,
    versao: v.versao,
    estado: v.estado,
    ref: v.ref,
    commit_sha: v.commitSha,
    tamanho_bytes: v.tamanhoBytes,
    sha256: v.sha256,
    total_questoes: v.totalQuestoes,
    submetido_em: v.submetidoEm.toISOString(),
    decidido_em: v.decididoEm?.toISOString(),
    decidido_por: curador ?? undefined,
    justificativa: v.justificativa ?? undefined,
    repositorio_url: jogo.repositorioUrl,
  }))

  const foco =
    todas.find((v) => v.id === versaoFocoId) ??
    todas.find((v) => v.estado === 'aprovado') ??
    todas.at(-1)
  if (!foco) return null

  const game: Game = {
    id: jogo.id,
    nome: jogo.nome,
    descricao: jogo.descricao,
    resumo: jogo.resumo ?? '',
    classico_referencia: jogo.classicoReferencia,
    mecanica: jogo.mecanica,
    tema: jogo.tema,
    nivel: jogo.nivel,
    autores: jogo.autores,
    controles: jogo.controles,
    capa: jogo.capa,
    repositorio_url: jogo.repositorioUrl,
    versao: foco.versao,
    status: foco.estado,
    versao_id: foco.id,
    tamanho_bytes: foco.tamanho_bytes,
    sha256: foco.sha256,
    nota_media: notas?.media ? Math.round(Number(notas.media) * 100) / 100 : 0,
    votos: notas?.total ?? 0,
    jogadores_distintos: jogadas?.jogadores ?? 0,
    partidas_jogadas: jogadas?.total ?? 0,
    versoes: todas,
  }
  return game
}
