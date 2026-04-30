import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard)
  @Get()
  public async getCart(@Request() req: { user: JwtPayload }) {
    return this.cartService.getCart(req.user.sessionId);
  }

  // --- NEW: Checkout ---
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  public async checkoutCart(@Request() req: { user: JwtPayload }) {
    // Notice how we pass BOTH the sessionId and the tableId securely from the token!
    return this.cartService.checkoutCart(req.user.sessionId, req.user.tableId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('request-bill')
  public async requestBill(@Request() req: { user: JwtPayload }) {
    return this.cartService.requestBill(req.user.sessionId, req.user.tableId);
  }
}
