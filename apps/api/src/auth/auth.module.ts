import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    EventsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_dinesync_key_2026',
      signOptions: { expiresIn: '4h' }, // Wristbands expire after 4 hours
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
