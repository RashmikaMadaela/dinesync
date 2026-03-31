import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt.guard';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Place the Bouncer in front of this specific route!
  @UseGuards(JwtAuthGuard)
  @Get()
  public async getMenu(@Request() req: { user: JwtPayload }) {
    // Because the Guard passed, we actually know WHO is making this request!
    console.log(`Table ${req.user.tableId} is looking at the menu.`);

    return this.menuService.getFullMenu();
  }
}
