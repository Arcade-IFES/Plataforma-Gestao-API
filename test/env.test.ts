import { describe, expect, it } from 'vitest'
import { loadEnv } from '../src/config/env.js'

describe('loadEnv', () => {
  it('aplica os valores padrão', () => {
    expect(loadEnv({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
    })
  })

  it('converte PORT para número', () => {
    expect(loadEnv({ PORT: '8080' }).PORT).toBe(8080)
  })

  it('lança erro listando as variáveis inválidas', () => {
    const carregar = () => loadEnv({ PORT: 'abc', NODE_ENV: 'staging' })

    expect(carregar).toThrow('Variáveis de ambiente inválidas')
    expect(carregar).toThrow('- PORT:')
    expect(carregar).toThrow('- NODE_ENV:')
  })
})
