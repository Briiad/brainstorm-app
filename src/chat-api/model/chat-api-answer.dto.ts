import { IsNotEmpty, IsString } from "class-validator";

export class ChatApiAnswerInputDto {
  @IsNotEmpty()
  @IsString()
  question: string;
}

export class ChatApiAnswerOutputDto {
  @IsNotEmpty()
  @IsString()
  response: string;
}