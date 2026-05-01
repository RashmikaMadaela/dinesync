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

  // --- NEW: Close the Table (Checkout) ---
  public async checkoutTable(tableId: number) {
    // 1. Find the table's currently active session (ignoring closed ones)
    const session = await this.prisma.session.findFirst({
      where: { 
        tableId: tableId,
        status: { not: 'CLOSED' } 
      },
    });

    if (!session) {
      throw new NotFoundException('No active session found for this table.');
    }

    // 2. Close the session, permanently locking the digital cart
    const closedSession = await this.prisma.session.update({
      where: { id: session.id },
      data: { 
        status: 'CLOSED',
        closedAt: new Date(), 
      },
    });

    return {
      message: `Table ${tableId} has been successfully closed and reset for new guests.`,
      session: closedSession,
    };
  }
}
