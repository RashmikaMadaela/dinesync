import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Create a native Postgres connection pool (Hardcoded to bypass Windows caching)
    const pool = new Pool({
      connectionString: 'postgresql://postgres:root@localhost:5433/dinesync?schema=public',
    });

    // 2. Wrap the pool in the new Prisma 7 Adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter into Prisma
    super({ adapter });
  }

  // Connects to the database when the NestJS app starts
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma v7');
  }

  // Disconnects cleanly when the app shuts down
  async onModuleDestroy() {
    await this.$disconnect();
  }
}