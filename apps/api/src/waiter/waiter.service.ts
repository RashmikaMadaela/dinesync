import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaiterService {
  constructor(private readonly prisma: PrismaService) {}

  public async getFloorPlan() {
    // Fetch all tables, but ONLY include sessions that are currently open
    return this.prisma.table.findMany({
      include: {
        sessions: {
          where: { status: { not: 'CLOSED' } },
          include: {
            orders: { where: { status: { not: 'CART' } } }, // See what food is ordered
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }
}
