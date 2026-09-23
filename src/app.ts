import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import type { Env } from './config/env.js'
import type { Db } from './db/client.js'
import { registerErrorHandlers } from './errors.js'
import { healthRoutes } from './routes/health.js'

export type AppOptions = {
  env: Env
  db: Db
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Db
  }
}

export async function buildApp({ env, db }: AppOptions) {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : { level: env.LOG_LEVEL },
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.decorate('db', db)

  registerErrorHandlers(app)

  await app.register(healthRoutes)

  return app
}

export type App = Awaited<ReturnType<typeof buildApp>>
