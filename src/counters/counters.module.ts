import { Global, Module } from '@nestjs/common';
import { CountersService } from './counters.service';
import { Counters, CountersSchema } from './schema/counters.entities';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Counters.name, schema: CountersSchema },
    ]),
  ],
  providers: [CountersService],
  exports: [CountersService],
})
export class CountersModule {}
