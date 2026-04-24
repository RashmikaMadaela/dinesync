import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [AuthModule, PrismaModule, EventsModule],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
