import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthService,
  JoinTableResponse,
  ApproveTableResponse,
} from './auth.service';

// Defining the shape of the incoming JSON body
export class JoinTableDto {
  tableId!: number;
  secret!: string;
  name!: string;
}

export class ApproveTableDto {
  tableId!: number;
  waiterName!: string;
}

@Controller('auth')
export class AuthController {
  // Added 'readonly' here as well
  constructor(private readonly authService: AuthService) {}

  @Post('join')
  public async joinTable(
    @Body() body: JoinTableDto,
  ): Promise<JoinTableResponse> {
    return this.authService.joinTable(body.tableId, body.secret, body.name);
  }

  @Post('approve')
  public async approveTable(
    @Body() body: ApproveTableDto,
  ): Promise<ApproveTableResponse> {
    return this.authService.approveTable(body.tableId, body.waiterName);
  }
}
