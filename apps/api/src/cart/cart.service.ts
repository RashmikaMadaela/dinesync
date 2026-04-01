import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

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
}
