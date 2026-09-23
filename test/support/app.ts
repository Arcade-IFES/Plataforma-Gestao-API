import { buildApp } from '../../src/app.js'
import { loadEnv } from '../../src/config/env.js'
import { createDb } from '../../src/db/client.js'
import { TEST_DATABASE_URL } from './database.js'

export async function createTestApp(databaseUrl = TEST_DATABASE_URL) {
  const env = loadEnv({ NODE_ENV: 'test', DATABASE_URL: databaseUrl })
  const { db, close } = createDb(env.DATABASE_URL)
  const app = await buildApp({ env, db })
  app.addHook('onClose', close)
  return app
}
