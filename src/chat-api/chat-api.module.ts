import { Module } from '@nestjs/common';
import { ChatApiService } from './chat-api.service';
import { ChatApiController } from './chat-api.controller';

@Module({
  providers: [ChatApiService],
  controllers: [ChatApiController]
})
export class ChatApiModule {}
