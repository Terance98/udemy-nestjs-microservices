import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AUTH_SERVICE } from '../constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from '@app/common';

/**
 * Basically when we inject an authClient with AUTH_SERVICE ( whose value is 'auth' ), that is basically the token a.k.a route through which we will be communicating to the auth microservice
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // The cookie-parser library needs to be configured in the main.ts file for all the microservices needs to use authentication since the token will be inside the cookie
    const jwt = context.switchToHttp().getRequest().cookies?.Authentication;

    if (!jwt) {
      return false;
    }

    /**
     * Here we are making a TCP request to the auth microservice
     * If we get the user data, then we are setting it onto the http request body using the rxjs tap() function
     * If we get a successful response from the RPC call, then we use the rxjs map() function to return true. This value will be returned to the canActivate function which will allow the http request to proceed
     */
    return this.authClient
      .send<UserDto>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          context.switchToHttp().getRequest().user = res;
        }),
        map(() => true),
        catchError(() => of(false)), // If there is any error, we are sending a new custom observable with value as false
      );
  }
}
