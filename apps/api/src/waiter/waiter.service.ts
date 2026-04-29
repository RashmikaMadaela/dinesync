import { Injectable, NotFoundException } from '@nestjs/common';
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
  public async serveOrder(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'SERVED' },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order successfully delivered to the table!',
      order,
    };
  }
}
