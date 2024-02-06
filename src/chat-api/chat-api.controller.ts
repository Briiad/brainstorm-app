import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ChatApiService } from './chat-api.service';
import { ChatApiAnswerInputDto, ChatApiAnswerOutputDto } from './model/chat-api-answer.dto';

@Controller('chat-api')
export class ChatApiController {
  constructor(private readonly service:ChatApiService){}

  @Post('/answer')
  getAiResponse(@Body() data: ChatApiAnswerInputDto){
    return this.service.getResponse(data.question);
  }

  @Post('/graph')
  convertGraph(@Body() data: ChatApiAnswerOutputDto){
    return this.service.convertGraph(data.response);
  }

  @Post('/update-response')
  updateResponse(@Body() data: ChatApiAnswerOutputDto){
    return this.service.updateResponse(data.response);
  }

  @Post('/reset')
  reset(){
    return this.service.resetProcess();
  }
}