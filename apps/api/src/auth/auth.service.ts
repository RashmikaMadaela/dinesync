/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { JwtService } from '@nestjs/jwt';
import { Session } from '@prisma/client';

// 1. Define the exact shape of our response to satisfy strict TypeScript
export interface JoinTableResponse {
  status: 'PENDING_HOST' | 'PENDING_GUEST';
  message: string;
  tableId?: number;
  hostId?: string | null;
}

export interface ApproveTableResponse {
  message: string;
  session: Session;
}

@Injectable()
export class AuthService {
  // 2. Added 'readonly' to satisfy ESLint
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly jwtService: JwtService,
  ) {}

  // 3. Added the strict Promise return type
  public async joinTable(
    tableId: number,
    secret: string,
    guestName: string,
  ): Promise<JoinTableResponse> {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      include: {
        sessions: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found in the system.');
    }

    if (table.qrSecret !== secret) {
      throw new UnauthorizedException(
        'Invalid QR code. Please scan the actual table sticker.',
      );
    }

    const activeSession = table.sessions[0];

    if (!activeSession) {
      this.eventsGateway.notifyWaiter(table.id, guestName);
      return {
        status: 'PENDING_HOST',
        message: `Welcome ${guestName}! You are requesting to open ${table.label}. Waiting for waiter approval...`,
        tableId: table.id,
      };
    }

    return {
      status: 'PENDING_GUEST',
      message: `${table.label} is currently active. Sending your join request to the Host...`,
      hostId: activeSession.hostId,
    };
  }
  public async approveTable(
    tableId: number,
    waiterName: string,
  ): Promise<ApproveTableResponse> {
    // 1. Double check the table exists
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException('Table not found.');
    }

    // 2. Create the official Session in the database
    const session = await this.prisma.session.create({
      data: {
        tableId: table.id,
        status: 'ACTIVE',
      },
    });

    // 3. Generate the VIP Wristband (JWT)
    const payload = {
      tableId: table.id,
      sessionId: session.id,
      role: 'GUEST',
    };

    const accessToken = this.jwtService.sign(payload);

    // 4. (Optional but awesome) Tell the Gateway to notify the customer's phone!
    this.eventsGateway.server.emit(`customer-approved-${tableId}`, {
      message: `${waiterName} has approved your table!`,
      token: accessToken,
    });

    return {
      message: `Successfully opened Table ${table.label}`,
      session,
    };
  }
}
