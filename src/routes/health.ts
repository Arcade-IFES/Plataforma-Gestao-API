import { z } from 'zod'
import type { App } from '../app.js'

export async function healthRoutes(app: App) {
  app.get(
    '/health',
    {
      schema: {
        response: {
          200: z.object({ status: z.literal('ok') }),
        },
      },
    },
    async () => ({ status: 'ok' as const }),
  )
}
