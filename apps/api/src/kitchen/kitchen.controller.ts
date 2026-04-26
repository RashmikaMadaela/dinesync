import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { UpdateOrderStatusDto } from './kitchen.dto';

@Controller('kitchen/orders')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get()
  public async getActiveOrders() {
    return this.kitchenService.getActiveOrders();
  }

  @Patch(':id/status')
  public async updateOrderStatus(
    @Param('id') id: string, // Grab the order ID from the URL
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.kitchenService.updateOrderStatus(id, body.status);
  }
}
