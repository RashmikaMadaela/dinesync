import { Module } from '@nestjs/common';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module'; 

@Module({
  imports: [PrismaModule, EventsModule], 
  controllers: [KitchenController],
  providers: [KitchenService],
})
export class KitchenModule {}