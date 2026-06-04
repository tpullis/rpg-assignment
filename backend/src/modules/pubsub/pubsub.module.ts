import { Module, Logger } from '@nestjs/common';
import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

// Injection token for the PubSub engine. Resolvers depend on this token, never
// on a concrete implementation, so in-memory vs Redis is a wiring detail.
export const PUB_SUB = 'PUB_SUB';

// Returns a Redis-backed engine when REDIS_HOST is configured (so events fan
// out across multiple server instances), otherwise an in-memory engine that
// keeps local dev and tests working with zero infrastructure.
function createPubSub(): PubSubEngine {
  const host = process.env.REDIS_HOST;
  const logger = new Logger('PubSub');

  // Default mode for this assignment, but can be extended to redis with the right infra setup
  if (!host) {
    logger.log('REDIS_HOST not set — using in-memory PubSub (single instance)');
    return new PubSub();
  }

  const connection = {
    host,
    port: Number(process.env.REDIS_PORT ?? 6379),
  };
  logger.log(`Using Redis PubSub at ${connection.host}:${connection.port}`);

  // RedisPubSub needs two connections: one stays in subscribe mode, the other
  // issues publish commands.
  return new RedisPubSub({
    publisher: new Redis(connection),
    subscriber: new Redis(connection),
  });
}

@Module({
  providers: [{ provide: PUB_SUB, useFactory: createPubSub }],
  exports: [PUB_SUB],
})
export class PubSubModule {}
