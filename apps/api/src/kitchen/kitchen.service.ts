import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // 1. Fetch the Kitchen Display Screen (KDS) Board
  public async getActiveOrders() {
    return this.prisma.order.findMany({
      where: {
        // We only care about tickets the kitchen actually needs to look at
        status: { in: ['PENDING', 'COOKING', 'READY'] },
      },
      include: {
        items: { include: { menuItem: true } },
        // Bring in the table info so the Chef knows where it's going!
        session: { include: { table: true } }, 
      },
      orderBy: { createdAt: 'asc' }, // The oldest tickets jump to the top of the list
    });
  }

  // 2. The Chef taps a button to update the ticket
  public async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { session: { include: { table: true } } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 3. THE REAL-TIME MAGIC: If the Chef marks it READY, ping the Waiter's iPad!
    if (status === 'READY') {
      this.eventsGateway.server.emit('order-ready', {
        message: `Order for Table ${order.session.table.label} is ready in the window!`,
        tableId: order.session.tableId,
        orderId: order.id,
      });
    }

    return order;
  }
}