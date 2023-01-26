import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'faizan@gmail.com',
          password: 'faizi123',
        } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: 'faizi123' } as User]),
      // remove: () => {},
      // update: () => {}
    };
    fakeAuthService = {
      login: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
      signup: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUserService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('faizanullah1999@gmail.com');
    expect(users.length).toEqual(1);
    expect(users[0]).toBeDefined();
    expect(users[0].email).toEqual('faizanullah1999@gmail.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUserService.findOne = () => null;
    let _error = null;
    try {
      await controller.findUser('1');
    } catch (error) {
      _error = error;
    }
    expect(_error).toBeDefined();
    expect(_error.message).toEqual('user not found');
  });

  it('loginUser updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.loginUser(
      { email: 'faizanullah1999@gmail.com', password: 'faizi123' },
      session
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
