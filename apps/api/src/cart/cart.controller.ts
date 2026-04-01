import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './cart.dto';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  public async addToCart(
    @Request() req: { user: JwtPayload },
    @Body() body: AddToCartDto,
  ) {
    return this.cartService.addItem(req.user.sessionId, body);
  }
}
