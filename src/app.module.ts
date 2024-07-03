import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { LogMiddleware } from './middlewares/log.middleware';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [CommonModule, UserModule],
  controllers: [],
  providers: [LogMiddleware, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('/api/*');
    consumer
      .apply(LogMiddleware, AuthMiddleware)
      .exclude(
        { path: '/api/users/login', method: RequestMethod.POST },
        { path: '/api/users/register', method: RequestMethod.POST },
      )
      .forRoutes('/api/*');
  }
}
