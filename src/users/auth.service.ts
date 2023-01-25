import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length > 0) {
      throw new BadRequestException('email in use');
    }
    // Hash user's password
    // Generate salt
    const salt = randomBytes(8).toString('hex'); // 16 character long string
    // Hash the slat and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer; // 32 character long
    // Join the hashes result ans salt together with dot (.) in middle
    const result = `${salt}.${hash.toString('hex')}`;
    // Create a new user and save it
    const user = await this.usersService.create(email, result);
    // Return user
    return user;
  }

  async login(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('wrong password');
    }
    return user;
  }
}
