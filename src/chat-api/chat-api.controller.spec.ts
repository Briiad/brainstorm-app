import { Test, TestingModule } from '@nestjs/testing';
import { ChatApiController } from './chat-api.controller';

describe('ChatApiController', () => {
  let controller: ChatApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatApiController],
    }).compile();

    controller = module.get<ChatApiController>(ChatApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
