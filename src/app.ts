import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import type { Env } from './config/env.js'
import type { Db } from './db/client.js'
import { registerErrorHandlers } from './errors.js'
import { createGithubClient, type GithubClient } from './github/cliente.js'
import { curadoresRoutes } from './routes/curadores.js'
import { estacoesRoutes } from './routes/estacoes.js'
import { healthRoutes } from './routes/health.js'
import { jogosRoutes } from './routes/jogos.js'
import { pacotesRoutes } from './routes/pacotes.js'
import { placaresRoutes } from './routes/placares.js'
import { previewRoutes } from './routes/preview.js'
import { versoesRoutes } from './routes/versoes.js'

export type AppOptions = {
  env: Env
  db: Db
  /** Nos testes, substitui o acesso real ao GitHub. */
  github?: GithubClient
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Db
    github: GithubClient
  }
}

export async function buildApp({ env, db, github }: AppOptions) {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : { level: env.LOG_LEVEL },
    // O Render fica na frente como proxy; assim protocolo e host vêm dos X-Forwarded-*.
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.decorate('db', db)
  app.decorate('github', github ?? createGithubClient({ token: env.GITHUB_TOKEN }))

  registerErrorHandlers(app)

  await app.register(healthRoutes)
  await app.register(curadoresRoutes)
  await app.register(estacoesRoutes)
  await app.register(jogosRoutes)
  await app.register(pacotesRoutes)
  await app.register(previewRoutes)
  await app.register(versoesRoutes)
  await app.register(placaresRoutes)

  return app
}

export type App = Awaited<ReturnType<typeof buildApp>>
