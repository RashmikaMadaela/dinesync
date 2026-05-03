import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './cart.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  public async addItem(sessionId: string, dto: AddToCartDto) {
    // 1. Verify the menu item exists
    const item = await this.prisma.menuItem.findUnique({
      where: { id: dto.menuItemId },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found.');
    }
    if (!item.isAvailable) {
      throw new BadRequestException('Sorry, this item is currently sold out!');
    }

    // 2. The Multiplayer Check: Does this session already have an open Cart?
    let order = await this.prisma.order.findFirst({
      where: {
        sessionId: sessionId,
        status: 'CART',
      },
    });

    // 3. If no cart exists yet, create the master ticket!
    if (!order) {
      order = await this.prisma.order.create({
        data: {
          sessionId: sessionId,
          status: 'CART',
          total: 0,
        },
      });
    }

    // 4. Create the specific OrderItem and attach it to the master ticket
    const orderItem = await this.prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId: item.id,
        quantity: dto.quantity,
        // We capture the price right now, in case the restaurant changes it tomorrow!
        priceAtOrder: item.price,
        // We safely map your notes string into your flexible JSON modifiers column
        modifiers: dto.notes ? { notes: dto.notes } : undefined,
      },
      include: {
        menuItem: true,
      },
    });

    // 5. Update the Master Ticket's total price
    const lineTotal = Number(item.price) * dto.quantity;
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        total: { increment: lineTotal },
      },
    });

    return {
      message: `Added ${dto.quantity}x ${item.name} to the table's cart.`,
      orderItem,
    };
  }
  // --- NEW: View the Cart ---
  public async getCart(sessionId: string) {
    const order = await this.prisma.order.findFirst({
      where: { sessionId, status: 'CART' },
      include: {
        items: {
          include: { menuItem: true }, // Bring in the food details!
        },
      },
    });

    if (!order) {
      return { message: 'Your cart is empty', items: [], total: 0 };
    }

    return order;
  }

  // --- NEW: Send to Kitchen ---
  public async checkoutCart(sessionId: string, tableId: number) {
    // 1. Find the active cart
    const order = await this.prisma.order.findFirst({
      where: { sessionId, status: 'CART' },
      include: { items: { include: { menuItem: true } } },
    });

    if (!order || order.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart.');
    }

    // 2. Lock the cart by changing the status to PENDING (Sent to Kitchen)
    const submittedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'PENDING' },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    // 3. THE REAL-TIME MAGIC: Alert the Kitchen!
    this.eventsGateway.server.emit('kitchen-alert', {
      message: `New Order for Table ${tableId}!`,
      orderId: submittedOrder.id,
      items: submittedOrder.items.map(
        (i) => `${i.quantity}x ${i.menuItem.name}`,
      ),
    });

    return {
      message: 'Order sent to the kitchen!',
      order: submittedOrder,
    };
  }

  public async requestBill(sessionId: string, tableId: number) {
    // 1. Change the session status so the Waiter knows they want to pay
    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'PAYMENT_REQ' },
    });

    // 2. THE REAL-TIME MAGIC: Ping the Waiter's iPad
    this.eventsGateway.server.emit('bill-requested', {
      message: `Table ${tableId} has requested the bill!`,
      tableId,
    });

    return {
      message: 'Bill requested! Your waiter will be right with you.',
      session,
    };
  }

  // --- NEW: Remove Item from Cart ---
  public async removeItem(sessionId: string, orderItemId: string) {
    // 1. Find the active cart for this session
    const order = await this.prisma.order.findFirst({
      where: { sessionId, status: 'CART' },
    });

    if (!order) {
      throw new NotFoundException('No active cart found.');
    }

    // 2. Find the item to make sure it exists and actually belongs to this cart
    const itemToRemove = await this.prisma.orderItem.findFirst({
      where: { id: orderItemId, orderId: order.id },
    });

    if (!itemToRemove) {
      throw new NotFoundException('Item not found in your cart.');
    }

    // 3. Delete the item and deduct the cost in one safe database transaction
    const lineTotal = Number(itemToRemove.priceAtOrder) * itemToRemove.quantity;

    await this.prisma.$transaction([
      this.prisma.orderItem.delete({ where: { id: orderItemId } }),
      this.prisma.order.update({
        where: { id: order.id },
        data: { total: { decrement: lineTotal } },
      }),
    ]);

    return { message: 'Item removed from cart successfully.' };
  }
}
