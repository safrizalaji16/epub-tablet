export class RegisterUserDto {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export class UserDto {
  username: string;
  email: string;
  role?: string;
  token?: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}
