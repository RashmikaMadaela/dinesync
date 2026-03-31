import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtPayload {
  tableId: number;
  sessionId: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Intercept the incoming request
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Look for the "Bearer <token>" in the headers
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Missing VIP wristband (Token). Access denied.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'super_secret_dinesync_key_2026',
      });

      // 4. Attach the decoded user data
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired wristband. Please scan the table again.',
      );
    }

    return true; // The door opens!
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
