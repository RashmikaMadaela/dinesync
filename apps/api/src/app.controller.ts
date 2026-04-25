import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  public checkHealth() {
    return {
      status: 'ok',
      service: 'dinesync-api',
      timestamp: new Date().toISOString(),
    };
  }
}
