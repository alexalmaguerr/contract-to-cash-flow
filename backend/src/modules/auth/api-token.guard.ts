/**
 * ApiTokenGuard — protege rutas con un token fijo para comunicación
 * servicio-a-servicio (ej. endpoint SIGE Hydra).
 *
 * Acepta:
 *   - Header: X-API-Key: <token>
 *   - Header: Authorization: Bearer <token>
 *
 * Uso:
 *   @UseGuards(ApiTokenGuard)
 *   @Get('sige-hydra')
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expectedToken = process.env.SIGE_HYDRA_API_TOKEN;

    if (!expectedToken || expectedToken.length < 16) {
      throw new UnauthorizedException(
        'API token no configurado. Configure SIGE_HYDRA_API_TOKEN en .env',
      );
    }

    const apiKey = request.headers['x-api-key'] as string | undefined;
    const authHeader = request.headers.authorization;
    const bearerToken =
      authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const receivedToken = apiKey ?? bearerToken;

    if (!receivedToken || receivedToken !== expectedToken) {
      throw new UnauthorizedException('Token de API inválido o ausente');
    }

    return true;
  }
}
