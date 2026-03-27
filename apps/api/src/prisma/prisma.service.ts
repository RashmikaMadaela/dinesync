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
    // 1. Pull the URL from the environment variables securely
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in the .env file');
    }

    // 2. Pass it into the pool
    const pool = new Pool({
      connectionString,
    });

    // 3. Wrap and pass to Prisma (keeping our 'as any' fix from earlier!)
    const adapter = new PrismaPg(pool as any);
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
