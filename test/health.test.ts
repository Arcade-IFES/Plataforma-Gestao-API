import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp, type App } from '../src/app.js'
import { loadEnv } from '../src/config/env.js'

describe('GET /health', () => {
  let app: App

  beforeAll(async () => {
    app = await buildApp({ env: loadEnv({ NODE_ENV: 'test' }) })
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('responde 200 com status ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })
})
