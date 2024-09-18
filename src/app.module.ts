import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { DogModule } from './dog/dog.module';
import { CryptoModule } from './crypto/crypto.module';
import { CountersModule } from './counters/counters.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { MessageModule } from './message/message.module';
import { WorkModule } from './work/work.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { FileModule } from './file/file.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/editor-backend'),

    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '3d',
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    UserModule,
    DogModule,
    CryptoModule,
    CountersModule,
    RedisModule,
    EmailModule,
    MessageModule,
    WorkModule,
    FileModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
