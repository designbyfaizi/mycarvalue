import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of user's service
    const users: User[] = [];
    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUserService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user wtih salted and hashed password', async () => {
    const user = await service.signup('faizanullah1999@gmail.com', 'faizi123');

    expect(user.password).not.toEqual('faizi123');

    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    let _error = null;
    await service.signup('faizanullah1999@gmail.com', 'faizi123');
    try {
      await service.signup('faizanullah1999@gmail.com', 'faizi123');
    } catch (error) {
      _error = error;
    }
    expect(_error.message).toMatch('email in use');
  });

  it('throws an error if signin is called with an unused email', async () => {
    try {
      await service.login('faizanullah1999@gmail.com', 'faizi123');
    } catch (error) {
      expect(error.message).toMatch('user not found');
    }
  });

  it('throws an error if an invalid password is provided', async () => {
    let error = null;
    await service.signup('faizanullah1999@gmail.com', 'faizi1234');
    try {
      await service.login('faizanullah1999@gmail.com', 'some invalid password');
    } catch (err) {
      error = err;
    }
    expect(error.message).toMatch('wrong password');
  });

  it('returns a user in case of correct password', async () => {
    await service.signup('faizanullah1999@gmail.com', 'faizi123');
    const user = await service.login('faizanullah1999@gmail.com', 'faizi123');
    expect(user).toBeDefined();
  });
});
