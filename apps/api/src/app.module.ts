import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { MenuModule } from './menu/menu.module';
import { CartModule } from './cart/cart.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { WaiterModule } from './waiter/waiter.module';

@Module({
  imports: [
    // This line tells NestJS to read the .env file and make it globally available!
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EventsModule,
    MenuModule,
    CartModule,
    KitchenModule,
    WaiterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
