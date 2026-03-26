import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // This makes PrismaService available everywhere without needing to import the module constantly
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Crucial: exposes the service to other modules
})
export class PrismaModule {}
