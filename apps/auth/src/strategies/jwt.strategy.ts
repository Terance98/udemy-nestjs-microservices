import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';

/**
 * Here the default value of Strategy will be 'jwt' since we are importing it from the passport-jwt
 * The guard associated with it will use this keyword to determine which strategy to use. In the case of jwt auth guard, we are specifying the value 'jwt' so it will make use of this strategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) =>
          request?.cookies?.Authentication || request?.Authentication, // Here we are setting request type to any and checking two possibilities because a request could be from a HTTP call or from a RPC call
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * Here in this strategy, the token payload will be returned back
   * So the token payload mainly contains userId so it will be returned as function parameter callback here
   * @param param0
   *
   * Then we return the user document, so this will get attached to the request object
   */
  async validate({ userId }: TokenPayload) {
    return this.userService.getUser({ _id: userId });
  }
}
