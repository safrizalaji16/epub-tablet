import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { LoginUserDto, RegisterUserDto, UserDto } from 'src/dto/user.dto';
import { comparePassword, hashPassword } from 'src/helpers/bcrypt';
import { generateToken } from 'src/helpers/jwt';
import { UserValidate } from './user.validation';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private configService: ConfigService,
  ) {}

  async getUsers(): Promise<UserDto[]> {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => {
      return {
        username: user.username,
        email: user.email,
      };
    });
  }

  async register(registerUserDto: RegisterUserDto): Promise<UserDto> {
    this.logger.debug(`Register new user ${JSON.stringify(registerUserDto)}`);

    const validatedRegisterUser = this.validationService.validate(
      UserValidate.Register,
      registerUserDto,
    );
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          { email: validatedRegisterUser.email },
          { username: validatedRegisterUser.username },
        ],
      },
    });

    if (user) {
      throw new HttpException('email or username already exists', 400);
    }

    const createdUser = await this.prismaService.user.create({
      data: {
        ...registerUserDto,
        password: await hashPassword(registerUserDto.password),
      },
    });

    return {
      username: createdUser.username,
      email: createdUser.email,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<UserDto> {
    this.logger.debug(`Login user ${JSON.stringify(loginUserDto)}`);

    const validatedLogin = this.validationService.validate(
      UserValidate.Login,
      loginUserDto,
    );
    const user = await this.prismaService.user.findFirst({
      where: {
        email: validatedLogin.email,
      },
    });

    if (!user) {
      throw new HttpException('email or password is incorrect', 401);
    }

    const isMatch = comparePassword(validatedLogin.password, user.password);

    if (!isMatch) {
      throw new HttpException('email or password is incorrect', 401);
    }

    const token = generateToken(user, this.configService);

    return {
      username: user.username,
      email: user.email,
      token,
    };
  }
}
