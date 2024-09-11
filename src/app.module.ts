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
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '.env'),
    }),
    ,
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
    MongooseModule.forRoot('mongodb://localhost:27017/editor-backend'),
    UserModule,
    DogModule,
    CryptoModule,
    CountersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
