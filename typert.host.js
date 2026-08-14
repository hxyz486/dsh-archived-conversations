/**
 * Strict Typert manifest for the dsh-archived-conversations host Remote
 * service. Mirrors the @deepseek-ai/dsh-typert-generator output shape so the
 * host gateway claims and dispatches `/api/archivedConversations/*` through
 * the strict path (no SRC markers involved).
 *
 * Registered at runtime by index.js via `ctx.typert.register(TYPERT)`.
 * The package intentionally does NOT export "./typert": the dsh-typert-loader
 * would register the same invocations again on the next boot and the registry
 * rejects duplicate endpoints.
 */
import { z } from 'zod';

const sessionIdSchema = z.string();

export const TYPERT = {
  package: 'dsh-archived-conversations',
  face: 'host',
  schemas: [],
  invocations: [
    {
      id: 'dsh-archived-conversations#archivedConversations/list',
      service: 'archivedConversations',
      namespace: 'archivedConversations',
      method: 'list',
      invocation: { kind: 'direct' },
      parameters: [],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-archived-conversations/types#ArchivedListResult',
        schema: z.any(),
      },
      sourceLocation: { file: 'index.js', line: 1, column: 1 },
    },
    {
      id: 'dsh-archived-conversations#archivedConversations/read',
      service: 'archivedConversations',
      namespace: 'archivedConversations',
      method: 'read',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'sessionId',
          wire: 'sessionId',
          source: 'json',
          codec: { mode: 'strict', typeSymbol: 'dsh-archived-conversations/types#SessionId', schema: sessionIdSchema },
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-archived-conversations/types#ArchivedReadResult',
        schema: z.any(),
      },
      sourceLocation: { file: 'index.js', line: 1, column: 1 },
    },
    {
      id: 'dsh-archived-conversations#archivedConversations/restore',
      service: 'archivedConversations',
      namespace: 'archivedConversations',
      method: 'restore',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'sessionId',
          wire: 'sessionId',
          source: 'json',
          codec: { mode: 'strict', typeSymbol: 'dsh-archived-conversations/types#SessionId', schema: sessionIdSchema },
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-archived-conversations/types#ArchivedRestoreResult',
        schema: z.any(),
      },
      sourceLocation: { file: 'index.js', line: 1, column: 1 },
    },
    {
      id: 'dsh-archived-conversations#archivedConversations/deleteSession',
      service: 'archivedConversations',
      namespace: 'archivedConversations',
      method: 'deleteSession',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'sessionId',
          wire: 'sessionId',
          source: 'json',
          codec: { mode: 'strict', typeSymbol: 'dsh-archived-conversations/types#SessionId', schema: sessionIdSchema },
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-archived-conversations/types#ArchivedDeleteResult',
        schema: z.any(),
      },
      sourceLocation: { file: 'index.js', line: 1, column: 1 },
    },
  ],
  model: { services: [], events: [], objects: [] },
};
