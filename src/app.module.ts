import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { DogModule } from './dog/dog.module';
import { CryptoModule } from './crypto/crypto.module';
import { CountersModule } from './counters/counters.module';

@Module({
  imports: [
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
