import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../users/users.service';

/**
 * This strategy is mainly for performing login operation
 * User will input his username and password and we will validate the user and return the user document
 * This user document will be attached to the request object
 * This user document is then used to generate a JWT token and then will be sent back as a cookie
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({ usernameField: 'email' });
  }

  /**
   * This validate function will be called by the PassportStrategy and it will pass in the email and password so that we can validate the same within our DB
   * @param email
   * @param password
   * @returns
   *
   * We are doing try catch here because if the user is not found then the repository will throw a document not found error, so are capturing it and throwing it as an unauthorized error
   * Also the value that we are returning here ( in this case, the user document ), will be added as a user property into the request object
   */
  async validate(email: string, password: string) {
    try {
      return await this.userService.validateUser(email, password);
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
