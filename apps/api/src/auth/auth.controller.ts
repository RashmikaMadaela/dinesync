import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, JoinTableResponse } from './auth.service';

// Defining the shape of the incoming JSON body
export class JoinTableDto {
  tableId: number;
  secret: string;
  name: string;
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
}
