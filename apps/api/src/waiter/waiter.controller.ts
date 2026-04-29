import { Controller, Get, Patch, Param } from '@nestjs/common';
import { WaiterService } from './waiter.service';

@Controller('waiter')
export class WaiterController {
  constructor(private readonly waiterService: WaiterService) {}

  @Get('floor-plan')
  public async getFloorPlan() {
    return this.waiterService.getFloorPlan();
  }

  @Patch('orders/:id/serve')
  public async serveOrder(@Param('id') id: string) {
    return this.waiterService.serveOrder(id);
  }
}
