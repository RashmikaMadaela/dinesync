import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  public async getFullMenu() {
    // Fetch all categories, and attach their menu items...
    const menu = await this.prisma.category.findMany({
      include: {
        items: {
          // ...but ONLY include the items that are currently available!
          where: {
            isAvailable: true,
          },
          // Optional: Don't send the massive vector embeddings to the frontend
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            trackStock: true,
            stockCount: true,
            categoryId: true,
          },
        },
      },
    });

    return menu;
  }
}
