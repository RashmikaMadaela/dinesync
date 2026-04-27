import { Controller, Get } from '@nestjs/common';
import { WaiterService } from './waiter.service';

@Controller('waiter')
export class WaiterController {
  constructor(private readonly waiterService: WaiterService) {}

  @Get('floor-plan')
  public async getFloorPlan() {
    return this.waiterService.getFloorPlan();
  }
}
