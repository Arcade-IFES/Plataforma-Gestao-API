import { buildApp } from '../../src/app.js'
import { loadEnv } from '../../src/config/env.js'
import { createDb } from '../../src/db/client.js'
import type { GithubClient } from '../../src/github/cliente.js'
import { TEST_DATABASE_URL } from './database.js'

/** GitHub falso: nenhum teste acessa a rede. */
const githubIndisponivelNosTestes: GithubClient = {
  resolverRef: async () => {
    throw new Error('Teste chamou o GitHub sem configurar um cliente falso.')
  },
  baixarZip: async () => {
    throw new Error('Teste chamou o GitHub sem configurar um cliente falso.')
  },
}

export async function createTestApp({
  databaseUrl = TEST_DATABASE_URL,
  github = githubIndisponivelNosTestes,
}: { databaseUrl?: string; github?: GithubClient } = {}) {
  const env = loadEnv({ NODE_ENV: 'test', DATABASE_URL: databaseUrl })
  const { db, close } = createDb(env.DATABASE_URL)
  const app = await buildApp({ env, db, github })
  app.addHook('onClose', close)
  return app
}
