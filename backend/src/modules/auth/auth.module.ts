import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { LdapStrategy } from './ldap.strategy';
import { InternalGuard } from './internal.guard';
import { PortalGuard } from './portal.guard';
import { ApiTokenGuard } from './api-token.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LdapStrategy,
    RolesGuard,
    InternalGuard,
    PortalGuard,
    ApiTokenGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    RolesGuard,
    InternalGuard,
    PortalGuard,
    ApiTokenGuard,
  ],
})
export class AuthModule {}
