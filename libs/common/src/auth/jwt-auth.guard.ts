import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AUTH_SERVICE } from '../constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '@app/common';
import { Reflector } from '@nestjs/core';

/**
 * Basically when we inject an authClient with AUTH_SERVICE ( whose value is 'auth' ), that is basically the token a.k.a route through which we will be communicating to the auth microservice
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // The cookie-parser library needs to be configured in the main.ts file for all the microservices needs to use authentication since the token will be inside the cookie
    const jwt =
      context.switchToHttp().getRequest().cookies?.Authentication ||
      context.switchToHttp().getRequest().headers?.authentication;

    if (!jwt) {
      return false;
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    /**
     * Here we are making a TCP request to the auth microservice
     * If we get the user data, then we are setting it onto the http request body using the rxjs tap() function
     * If we get a successful response from the RPC call, then we use the rxjs map() function to return true. This value will be returned to the canActivate function which will allow the http request to proceed
     */
    return this.authClient
      .send<User>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          if (roles) {
            for (const role of roles) {
              if (!res.roles?.map((role) => role.name).includes(role)) {
                this.logger.error('The user does not have valid roles.');
                throw new UnauthorizedException();
              }
            }
          }

          context.switchToHttp().getRequest().user = res;
        }),
        map(() => true),
        catchError((err) => {
          this.logger.error(err);
          return of(false);
        }), // If there is any error, we are sending a new custom observable with value as false
      );
  }
}
