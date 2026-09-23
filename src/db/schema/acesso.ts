import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Só o hash SHA-256 do token fica no banco; o token é mostrado uma única vez.

export const curadores = pgTable('curadores', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  tokenHash: text().notNull().unique(),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const estacoes = pgTable('estacoes', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  tokenHash: text().notNull().unique(),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
