import type { FastifyError, FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Mensagens de validação do Zod em português.
z.config(z.locales.ptBR())

export type ErrorBody = {
  codigo: string
  erro: string
}

/** Erro de negócio que vira uma resposta `{ codigo, erro }` com o status informado. */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly codigo: string,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function registerErrorHandlers(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    const body: ErrorBody = {
      codigo: 'NAO_ENCONTRADO',
      erro: `Rota ${request.method} ${request.url} não existe.`,
    }
    return reply.status(404).send(body)
  })

  app.setErrorHandler<FastifyError | AppError>((error, request, reply) => {
    if (error instanceof AppError) {
      const body: ErrorBody = { codigo: error.codigo, erro: error.message }
      return reply.status(error.statusCode).send(body)
    }

    if (hasZodFastifySchemaValidationErrors(error)) {
      const local = error.validationContext ?? 'requisição'
      const problemas = error.validation
        .map((issue) => {
          const campo = issue.instancePath.replace(/^\//, '').replaceAll('/', '.')
          return campo ? `${campo}: ${issue.message}` : issue.message
        })
        .join('; ')
      const body: ErrorBody = {
        codigo: 'REQUISICAO_INVALIDA',
        erro: `Dados inválidos em ${local}: ${problemas}`,
      }
      return reply.status(400).send(body)
    }

    if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
      const body: ErrorBody = {
        codigo: 'REQUISICAO_INVALIDA',
        erro: 'O corpo da requisição não é um JSON válido.',
      }
      return reply.status(400).send(body)
    }

    const statusCode = error.statusCode ?? 500

    if (statusCode < 500) {
      const body: ErrorBody = { codigo: 'REQUISICAO_INVALIDA', erro: error.message }
      return reply.status(statusCode).send(body)
    }

    request.log.error({ err: error }, 'erro não tratado')
    const body: ErrorBody = {
      codigo: 'ERRO_INTERNO',
      erro: 'Erro interno no servidor. Tente novamente mais tarde.',
    }
    return reply.status(500).send(body)
  })
}
