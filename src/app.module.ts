import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { DogModule } from './dog/dog.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/editor-backend'),
    UserModule,
    DogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
